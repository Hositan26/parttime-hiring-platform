package tanhs.fudn.parttime_hiring_plaform_project.repository.employer;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Store;

public interface StoreRepository extends JpaRepository<Store, Integer> {
    // Searches store names and filters approval independently from activity.
    @Query("select s from Store s where (:active is null or s.isActive = :active) "
            + "and (:approved is null or s.isApproved = :approved) "
            + "and lower(s.storeName) like lower(concat('%', :query, '%'))")
    Page<Store> searchAdministration(@Param("query") String query,
            @Param("active") Boolean active, @Param("approved") Boolean approved,
            Pageable pageable);

    // Counts stores awaiting independent approval.
    long countByIsApproved(Boolean approved);

    // Locks the store before changing activity or approval.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Store s where s.storeId = :id")
    Optional<Store> lockById(@Param("id") Integer id);

    long countByEmployer_EmployerId(Integer employerId);
    java.util.List<Store> findByEmployer_EmployerId(Integer employerId);
    Page<Store> findByIsActive(Boolean isActive, Pageable pageable);
}
