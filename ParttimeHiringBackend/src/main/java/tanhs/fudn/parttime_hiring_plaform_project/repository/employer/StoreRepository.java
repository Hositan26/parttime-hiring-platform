package tanhs.fudn.parttime_hiring_plaform_project.repository.employer;

import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Store;

public interface StoreRepository extends JpaRepository<Store, Integer> {
    // Counts stores awaiting independent approval.
    long countByIsApproved(Boolean approved);

    // Locks the store before changing activity or approval.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Store s where s.storeId = :id")
    Optional<Store> lockById(@Param("id") Integer id);

    long countByEmployer_EmployerId(Integer employerId);
    java.util.List<Store> findByEmployer_EmployerId(Integer employerId);
    org.springframework.data.domain.Page<Store> findByIsActive(Boolean isActive, org.springframework.data.domain.Pageable pageable);
}
