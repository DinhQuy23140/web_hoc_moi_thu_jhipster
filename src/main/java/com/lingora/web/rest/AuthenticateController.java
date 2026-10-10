package com.lingora.web.rest;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.lingora.security.TokenService;
import com.lingora.service.GoogleAuthService;
import com.lingora.web.rest.vm.LoginVM;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.security.Principal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * Controller to authenticate users (email + password, or a Google ID token).
 */
@RestController
@RequestMapping("/api")
public class AuthenticateController {

    private static final Logger LOG = LoggerFactory.getLogger(AuthenticateController.class);

    private final TokenService tokenService;
    private final GoogleAuthService googleAuthService;
    private final AuthenticationManagerBuilder authenticationManagerBuilder;

    public AuthenticateController(
        TokenService tokenService,
        GoogleAuthService googleAuthService,
        AuthenticationManagerBuilder authenticationManagerBuilder
    ) {
        this.tokenService = tokenService;
        this.googleAuthService = googleAuthService;
        this.authenticationManagerBuilder = authenticationManagerBuilder;
    }

    @PostMapping("/authenticate")
    public ResponseEntity<JWTToken> authorize(@Valid @RequestBody LoginVM loginVM) {
        var authenticationToken = new UsernamePasswordAuthenticationToken(loginVM.getUsername(), loginVM.getPassword());
        var authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return tokenResponse(this.createToken(authentication, loginVM.isRememberMe()));
    }

    /** {@code POST /authenticate/google} : exchange a Google Identity Services credential for an app token. */
    @PostMapping("/authenticate/google")
    public ResponseEntity<JWTToken> authorizeGoogle(@Valid @RequestBody GoogleLoginVM vm) {
        Authentication authentication = googleAuthService.authenticate(vm.credential, vm.langKey);
        return tokenResponse(this.createToken(authentication, true));
    }

    /**
     * {@code GET /authenticate} : check if the user is authenticated.
     *
     * @return the {@link ResponseEntity} with status {@code 204 (No Content)},
     * or with status {@code 401 (Unauthorized)} if not authenticated.
     */
    @GetMapping("/authenticate")
    public ResponseEntity<Void> isAuthenticated(Principal principal) {
        LOG.debug("REST request to check if the current user is authenticated");
        return ResponseEntity.status(principal == null ? HttpStatus.UNAUTHORIZED : HttpStatus.NO_CONTENT).build();
    }

    public String createToken(Authentication authentication, boolean rememberMe) {
        return tokenService.createToken(authentication, rememberMe);
    }

    private static ResponseEntity<JWTToken> tokenResponse(String jwt) {
        var httpHeaders = new HttpHeaders();
        httpHeaders.setBearerAuth(jwt);
        return new ResponseEntity<>(new JWTToken(jwt), httpHeaders, HttpStatus.OK);
    }

    public static class GoogleLoginVM {

        @NotBlank
        public String credential;

        public String langKey;
    }

    /**
     * Object to return as body in JWT Authentication.
     */
    static class JWTToken {

        private String idToken;

        JWTToken(String idToken) {
            this.idToken = idToken;
        }

        @JsonProperty("id_token")
        String getIdToken() {
            return idToken;
        }

        void setIdToken(String idToken) {
            this.idToken = idToken;
        }
    }
}
