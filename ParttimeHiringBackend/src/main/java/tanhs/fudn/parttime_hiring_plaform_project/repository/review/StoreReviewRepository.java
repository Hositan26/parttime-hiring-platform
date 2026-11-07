package tanhs.fudn.parttime_hiring_plaform_project.repository.review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tanhs.fudn.parttime_hiring_plaform_project.entity.review.StoreReview;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoreReviewRepository extends JpaRepository<StoreReview, Integer> {
    
    // Searches store or reviewer names before moderation pagination.
    @org.springframework.data.jpa.repository.Query("select r from StoreReview r where lower(r.store.storeName) like lower(concat('%', :query, '%')) "
            + "or lower(r.reviewer.displayName) like lower(concat('%', :query, '%')) or lower(r.reviewer.username) like lower(concat('%', :query, '%'))")
    org.springframework.data.domain.Page<StoreReview> searchAdministration(@org.springframework.data.repository.query.Param("query") String query,
            org.springframework.data.domain.Pageable pageable);

    Optional<StoreReview> findByEmploymentRecord_EmploymentRecordId(Integer employmentRecordId);
    
    List<StoreReview> findByEmploymentRecord_EmploymentRecordIdIn(List<Integer> employmentRecordIds);
    
    List<StoreReview> findByEmploymentRecord_JobPost_JobPostIdOrderByCreatedAtDesc(Integer jobPostId);
}
