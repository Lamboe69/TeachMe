package ug.tutorug.api.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;
import ug.tutorug.api.config.AppProperties;
import ug.tutorug.api.domain.User;

/** Creates and verifies the signed JWTs used for bearer authentication. */
@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMillis;
    private final String issuer;

    public JwtService(AppProperties properties) {
        AppProperties.Jwt jwt = properties.getJwt();
        this.key = Keys.hmacShaKeyFor(jwt.getSecret().getBytes(StandardCharsets.UTF_8));
        this.expirationMillis = jwt.getExpirationMinutes() * 60_000L;
        this.issuer = jwt.getIssuer();
    }

    public String generateToken(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getId())
                .issuer(issuer)
                .claim("role", user.getRole().name())
                .claim("email", user.getEmail())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expirationMillis)))
                .signWith(key)
                .compact();
    }

    /** Returns the user id encoded in the token, or empty when it is invalid. */
    public Optional<String> extractUserId(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .requireIssuer(issuer)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return Optional.ofNullable(claims.getSubject());
        } catch (JwtException | IllegalArgumentException ex) {
            return Optional.empty();
        }
    }
}
