package tanhs.fudn.parttime_hiring_plaform_project.repository.employer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.EmployerVerification;

import java.util.Optional;

@Repository
public interface EmployerVerificationRepository extends JpaRepository<EmployerVerification, Integer> {
    // Locks an application before making an administrative decision.
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select v from EmployerVerification v join fetch v.user where v.verificationId = :id")
    Optional<EmployerVerification> lockById(@org.springframework.data.repository.query.Param("id") Integer id);
    Optional<EmployerVerification> findByUserIdAndVerificationStatus(Long userId, tanhs.fudn.parttime_hiring_plaform_project.entity.enums.VerificationStatus status);
    
    Optional<EmployerVerification> findFirstByUserIdOrderByVerificationIdDesc(Long userId);
    
    org.springframework.data.domain.Page<EmployerVerification> findByVerificationStatus(tanhs.fudn.parttime_hiring_plaform_project.entity.enums.VerificationStatus status, org.springframework.data.domain.Pageable pageable);
}

