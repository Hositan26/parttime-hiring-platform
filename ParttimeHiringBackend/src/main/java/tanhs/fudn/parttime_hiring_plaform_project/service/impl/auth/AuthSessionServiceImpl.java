package tanhs.fudn.parttime_hiring_plaform_project.service.impl.auth;

import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.RevokedAccessToken;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.RevokedAccessTokenRepository;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Instant;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.RefreshSession;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.exception.UnauthorizedException;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.RefreshSessionRepository;
import tanhs.fudn.parttime_hiring_plaform_project.security.AuthCookieService;
import tanhs.fudn.parttime_hiring_plaform_project.security.JwtTokenProvider;
import tanhs.fudn.parttime_hiring_plaform_project.security.TokenDigests;
import tanhs.fudn.parttime_hiring_plaform_project.service.auth.AuthSessionService;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthSessionServiceImpl implements AuthSessionService {
    private final RefreshSessionRepository repository;
    private final JwtTokenProvider tokens;
    private final RevokedAccessTokenRepository revokedTokens;
    private final AuthCookieService cookies;
    @Value("${jwt.refreshable-duration:7200}")
    private long refreshSeconds = 7200;

    // Starts an independently revocable refresh family for this browser.
    @Transactional
    public void start(User user, HttpServletResponse response) {
        if (!Boolean.TRUE.equals(user.getIsActive())) throw new UnauthorizedException("Account is unavailable");
        issue(user, UUID.randomUUID().toString(), Instant.now().plusSeconds(refreshSeconds), response);
    }

    // Rotates credentials atomically and revokes families when replay is detected.
    @Transactional(noRollbackFor = UnauthorizedException.class)
    public void refresh(String token, HttpServletResponse response) {
        if (token == null || token.isBlank()) throw new UnauthorizedException("Session expired");
        RefreshSession session = repository.lockByHash(TokenDigests.hash(token))
                .orElseThrow(() -> new UnauthorizedException("Session expired"));
        if (session.isConsumed() || session.isRevoked() || !session.getExpiresAt().isAfter(Instant.now())
                || !Boolean.TRUE.equals(session.getUser().getIsActive())) {
            repository.revokeFamily(session.getFamily());
            if (session.isConsumed() && session.getUser() != null) {
                session.getUser().setAuthVersion(session.getUser().getAuthVersion() + 1);
                repository.revokeUser(session.getUser().getId());
            }
            cookies.clear(response);
            throw new UnauthorizedException("Session expired");
        }
        session.setConsumed(true);
        repository.save(session);
        issue(session.getUser(), session.getFamily(), session.getExpiresAt(), response);
    }

    // Revokes browser credentials while preserving unrelated browser sessions.
    @Transactional
    public void logout(String refresh, String access, HttpServletResponse response) {
        if (refresh != null && !refresh.isBlank()) {
            repository.lockByHash(TokenDigests.hash(refresh)).ifPresent(session -> repository.revokeFamily(session.getFamily()));
        }
        var validated = tokens.validClaims(access);
        if (validated.isPresent()) {
            var claims = validated.get();
            var revoked = new RevokedAccessToken();
            revoked.setId(claims.getId());
            revoked.setExpiresAt(claims.getExpiration().toInstant());
            revokedTokens.save(revoked);
        }
        cookies.clear(response);
    }
    // Persists a credential digest and sends tokens only through HttpOnly cookies.
    private void issue(User user, String family, Instant expiresAt, HttpServletResponse response) {
        String raw = TokenDigests.randomToken();
        RefreshSession session = new RefreshSession();
        session.setTokenHash(TokenDigests.hash(raw));
        session.setFamily(family);
        session.setUser(user);
        session.setExpiresAt(expiresAt);
        repository.save(session);
        cookies.writeAccess(response, tokens.generateTokenForUser(user), tokens.getExpirationSeconds());
        cookies.write(response, "refresh_token", raw, Math.max(0, expiresAt.getEpochSecond() - Instant.now().getEpochSecond()), "/");
    }
}
