package tanhs.fudn.parttime_hiring_plaform_project.security;

import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;

import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {
    private final Key signingKey;
    private final long expirationSeconds;
    private final String issuer;

    // Requires a sufficiently strong signing key before accepting requests.
    public JwtTokenProvider(@Value("${jwt.signerKey}") String secret,
                            @Value("${jwt.valid-duration}") long expirationSeconds,
                            @Value("${jwt.issuer:parttime-hiring-platform}") String issuer) {
        if (secret.getBytes(StandardCharsets.UTF_8).length < 64 || expirationSeconds <= 0) {
            throw new IllegalArgumentException("JWT requires a 64-byte secret and positive lifetime");
        }
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationSeconds = expirationSeconds;
        this.issuer = issuer;
    }

    // Binds access credentials to the current account security version.
    public String generateTokenForUser(User user) {
        return issue(user.getId().toString(), user.getAuthVersion());
    }
    // Signs versioned access credentials for revocation after security changes.
    private String issue(String username, int version) {
        Date now = new Date();
        return Jwts.builder().setSubject(username).setIssuer(issuer)
                .setId(UUID.randomUUID().toString()).claim("type", "access").claim("version", version)
                .setIssuedAt(now).setExpiration(new Date(now.getTime() + expirationSeconds * 1000))
                .signWith(signingKey, SignatureAlgorithm.HS512).compact();
    }

    // Extracts the account identity only after validating token claims.
    public String getSubject(String token) {
        return parseClaims(token).getSubject();
    }

    // Rejects forged, expired, malformed, or incorrectly scoped access tokens.
    public boolean validateToken(String token) {
        return validClaims(token).isPresent();
    }
    // Parses credentials once so expiration races cannot become server errors.
    public Optional<Claims> validClaims(String token) {
        try {
            return Optional.of(parseClaims(token));
        } catch (JwtException | IllegalArgumentException exception) {
            return Optional.empty();
        }
    }

    // Validates required issuer, signature, subject, lifetime, and token purpose.
    public Claims parseClaims(String token) {
        Claims claims = Jwts.parserBuilder().setSigningKey(signingKey).requireIssuer(issuer)
                .require("type", "access").build().parseClaimsJws(token).getBody();
        if (claims.getSubject() == null || claims.getSubject().isBlank()
                || claims.getId() == null || claims.getExpiration() == null || claims.getIssuedAt() == null) {
            throw new IllegalArgumentException("Missing access token claims");
        }
        if (Long.parseLong(claims.getSubject()) <= 0) throw new IllegalArgumentException("Invalid account identity");
        return claims;
    }

    // Returns the access lifetime for consistent browser cookie expiration.
    public long getExpirationSeconds() {
        return expirationSeconds;
    }
}
