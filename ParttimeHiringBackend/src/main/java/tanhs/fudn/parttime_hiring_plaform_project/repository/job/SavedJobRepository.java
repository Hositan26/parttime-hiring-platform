package tanhs.fudn.parttime_hiring_plaform_project.repository.job;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.SavedJob;

public interface SavedJobRepository extends JpaRepository<SavedJob, Long> {
    // Lists saved recruitment opportunities belonging to one account.
    @EntityGraph(attributePaths = {"jobPost", "jobPost.store", "jobPost.employer"})
    Page<SavedJob> findByUser_Id(Long userId, Pageable pageable);
    // Checks account-scoped uniqueness before an idempotent save.
    boolean existsByUser_IdAndJobPost_JobPostId(Long userId, Integer jobId);
    // Removes only the specified account's saved opportunity.
    void deleteByUser_IdAndJobPost_JobPostId(Long userId, Integer jobId);
}
