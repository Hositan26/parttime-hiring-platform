package tanhs.fudn.parttime_hiring_plaform_project.repository.employer;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.VerificationStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.EmployerVerification;

import java.util.Optional;

@Repository
public interface EmployerVerificationRepository extends JpaRepository<EmployerVerification, Integer> {
    // Locks an application before making an administrative decision.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from EmployerVerification v join fetch v.user where v.verificationId = :id")
    Optional<EmployerVerification> lockById(@Param("id") Integer id);
    Optional<EmployerVerification> findByUserIdAndVerificationStatus(Long userId, VerificationStatus status);
    
    Optional<EmployerVerification> findFirstByUserIdOrderByVerificationIdDesc(Long userId);
    
    Page<EmployerVerification> findByVerificationStatus(VerificationStatus status, Pageable pageable);
}
