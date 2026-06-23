package tanhs.fudn.parttime_hiring_plaform_project.repository.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.EmailVerificationOtp;

import java.util.Optional;

@Repository
public interface EmailVerificationOtpRepository extends JpaRepository<EmailVerificationOtp, Long> {
    Optional<EmailVerificationOtp> findTopByEmailAndIsUsedFalseOrderByExpirationTimeDesc(String email);
}
