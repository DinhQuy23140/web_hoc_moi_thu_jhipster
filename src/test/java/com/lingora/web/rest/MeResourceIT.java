package com.lingora.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.lingora.IntegrationTest;
import com.lingora.domain.User;
import com.lingora.repository.UserRepository;
import com.lingora.security.AuthoritiesConstants;
import com.lingora.security.SecurityUtils;
import com.lingora.service.learning.Gamification;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

/**
 * Integration tests for the {@link MeResource} REST controller: client-reported XP limits and token revocation.
 */
@AutoConfigureMockMvc
@IntegrationTest
@Transactional
class MeResourceIT {

    private static final JsonMapper JSON = JsonMapper.builder().build();

    @Autowired
    private MockMvc mvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User user;

    @BeforeEach
    void initTest() {
        user = new User();
        user.setLogin("me-resource-it@example.com");
        user.setEmail("me-resource-it@example.com");
        user.setPassword(passwordEncoder.encode("password1"));
        user.setActivated(true);
        user.setLangKey("vi");
        userRepository.saveAndFlush(user);
    }

    private RequestPostProcessor learner() {
        return jwt()
            .jwt(j -> j.subject(user.getLogin()).claim(SecurityUtils.USER_ID_CLAIM, user.getId()))
            .authorities(new SimpleGrantedAuthority(AuthoritiesConstants.USER));
    }

    private int postActivity(String body) throws Exception {
        String res = mvc
            .perform(post("/api/me/activity").with(learner()).contentType(MediaType.APPLICATION_JSON).content(body))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
        return JSON.readTree(res).get("xpGained").asInt();
    }

    @Test
    void clientXpMustBeBackedByAnsweredExercises() throws Exception {
        assertThat(postActivity("{\"xp\":500}")).isEqualTo(Gamification.MAX_CLIENT_XP_BONUS);
    }

    @Test
    void clientXpStopsAtTheDailyCeiling() throws Exception {
        int total = 0;
        for (int i = 0; i < 10; i++) total += postActivity("{\"xp\":500,\"exercises\":500}");
        assertThat(total).isEqualTo(Gamification.MAX_CLIENT_XP_PER_DAY);
    }

    @Test
    void hugeNumbersAreClampedInsteadOfFailing() throws Exception {
        assertThat(postActivity("{\"xp\":" + "9".repeat(400) + ",\"exercises\":10}")).isZero();
        assertThat(postActivity("{\"xp\":99999999999999999999999999999999999999,\"exercises\":-5}")).isEqualTo(
            Gamification.MAX_CLIENT_XP_BONUS
        );
    }

    @Test
    void tokenIssuedBeforeThePasswordChangeIsRejected() throws Exception {
        mvc.perform(get("/api/me").with(learner())).andExpect(status().isOk());
        mvc
            .perform(
                get("/api/me").with(
                    jwt()
                        .jwt(j ->
                            j
                                .subject(user.getLogin())
                                .claim(SecurityUtils.USER_ID_CLAIM, user.getId())
                                .claim(SecurityUtils.PASSWORD_STAMP_CLAIM, "outdated-stamp")
                        )
                        .authorities(new SimpleGrantedAuthority(AuthoritiesConstants.USER))
                )
            )
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.code").value("token-revoked"));
    }
}
