package tanhs.fudn.parttime_hiring_plaform_project.repository.employer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.EmployerVerification;

import java.util.Optional;

@Repository
public interface EmployerVerificationRepository extends JpaRepository<EmployerVerification, Integer> {
    Optional<EmployerVerification> findByUserIdAndVerificationStatus(Long userId, tanhs.fudn.parttime_hiring_plaform_project.entity.enums.VerificationStatus status);
    
    Optional<EmployerVerification> findFirstByUserIdOrderByVerificationIdDesc(Long userId);
}
