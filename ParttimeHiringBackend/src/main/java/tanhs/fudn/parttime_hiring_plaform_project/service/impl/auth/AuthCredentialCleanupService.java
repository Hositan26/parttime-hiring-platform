package tanhs.fudn.parttime_hiring_plaform_project.service.impl.auth;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.PasswordResetTokenRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.RefreshSessionRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.RevokedAccessTokenRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthCredentialCleanupService {
    private final RefreshSessionRepository refreshSessions;
    private final RevokedAccessTokenRepository revokedAccess;
    private final PasswordResetTokenRepository resetTokens;

    // Removes expired credentials after their replay and revocation windows close.
    @Scheduled(fixedDelayString = "${app.auth.cleanup-delay-ms:3600000}", initialDelayString = "${app.auth.cleanup-delay-ms:3600000}")
    @Transactional
    public void removeExpired() {
        Instant now = Instant.now();
        refreshSessions.deleteExpired(now);
        revokedAccess.deleteExpired(now);
        resetTokens.deleteExpired(now);
    }
}
