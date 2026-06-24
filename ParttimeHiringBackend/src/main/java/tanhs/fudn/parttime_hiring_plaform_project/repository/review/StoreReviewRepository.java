package tanhs.fudn.parttime_hiring_plaform_project.repository.review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tanhs.fudn.parttime_hiring_plaform_project.entity.review.StoreReview;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoreReviewRepository extends JpaRepository<StoreReview, Integer> {
    
    Optional<StoreReview> findByEmploymentRecord_EmploymentRecordId(Integer employmentRecordId);
    
    List<StoreReview> findByEmploymentRecord_EmploymentRecordIdIn(List<Integer> employmentRecordIds);
    
    List<StoreReview> findByEmploymentRecord_JobPost_JobPostIdOrderByCreatedAtDesc(Integer jobPostId);
}
