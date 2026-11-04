package tanhs.fudn.parttime_hiring_plaform_project.repository.user;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.EmailVerificationOtp;

public interface EmailVerificationOtpRepository extends JpaRepository<EmailVerificationOtp, Long> {
    // Locks the latest challenge for the requesting account and normalized email.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<EmailVerificationOtp> findTopByOwner_IdAndEmailOrderByExpirationTimeDesc(Long userId, String email);
}
