package com.lingora.security.jwt;

import com.lingora.config.ApplicationProperties;
import com.lingora.config.SecurityConfiguration;
import com.lingora.config.SecurityJwtConfiguration;
import com.lingora.config.WebConfigurer;
import com.lingora.management.SecurityMetersService;
import com.lingora.security.TokenService;
import com.lingora.service.GoogleAuthService;
import com.lingora.web.rest.AuthenticateController;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import tech.jhipster.config.JHipsterProperties;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@SpringBootTest(
    properties = {
        "jhipster.security.authentication.jwt.base64-secret=fd54a45s65fds737b9aafcb3412e07ed99b267f33413274720ddbb7f6c5e64e9f14075f2d7ed041592f0b7657baf8",
        "jhipster.security.authentication.jwt.token-validity-in-seconds=60000",
    },
    classes = {
        JHipsterProperties.class,
        ApplicationProperties.class,
        WebConfigurer.class,
        SecurityConfiguration.class,
        SecurityJwtConfiguration.class,
        SecurityMetersService.class,
        AuthenticateController.class,
        JwtAuthenticationTestUtils.class,
    }
)
@MockitoBean(types = { TokenService.class, GoogleAuthService.class })
public @interface AuthenticationIntegrationTest {}
