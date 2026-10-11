package com.lingora.security;

import static com.lingora.security.SecurityUtils.AUTHORITIES_CLAIM;
import static com.lingora.security.SecurityUtils.JWT_ALGORITHM;
import static com.lingora.security.SecurityUtils.PASSWORD_STAMP_CLAIM;
import static com.lingora.security.SecurityUtils.USER_ID_CLAIM;

import com.lingora.security.DomainUserDetailsService.UserWithId;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

/** Issues the application's HS512 JWT access tokens. */
@Service
public class TokenService {

    private final JwtEncoder jwtEncoder;
    private final AccountStatusCache statuses;

    @Value("${jhipster.security.authentication.jwt.token-validity-in-seconds:0}")
    private long tokenValidityInSeconds;

    @Value("${jhipster.security.authentication.jwt.token-validity-in-seconds-for-remember-me:0}")
    private long tokenValidityInSecondsForRememberMe;

    public TokenService(JwtEncoder jwtEncoder, AccountStatusCache statuses) {
        this.jwtEncoder = jwtEncoder;
        this.statuses = statuses;
    }

    public String createToken(Authentication authentication, boolean rememberMe) {
        String authorities = authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.joining(" "));
        Instant now = Instant.now();
        Instant validity = now.plus(rememberMe ? tokenValidityInSecondsForRememberMe : tokenValidityInSeconds, ChronoUnit.SECONDS);
        JwtClaimsSet.Builder builder = JwtClaimsSet.builder()
            .issuedAt(now)
            .expiresAt(validity)
            .subject(authentication.getName())
            .claim(AUTHORITIES_CLAIM, authorities);
        if (authentication.getPrincipal() instanceof UserWithId user) {
            builder.claim(USER_ID_CLAIM, user.getId());
            builder.claim(PASSWORD_STAMP_CLAIM, statuses.refresh(user.getId()).passwordStamp());
        }
        JwsHeader jwsHeader = JwsHeader.with(JWT_ALGORITHM).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, builder.build())).getTokenValue();
    }
}
