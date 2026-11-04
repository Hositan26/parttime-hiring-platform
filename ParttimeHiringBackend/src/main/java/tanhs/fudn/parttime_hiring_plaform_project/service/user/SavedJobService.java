package tanhs.fudn.parttime_hiring_plaform_project.service.user;

import org.springframework.data.domain.Page;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.job.JobPostResponse;

public interface SavedJobService {
    // Lists saved opportunities for the authenticated account.
    Page<JobPostResponse> list(String username, int page, int size);
    // Idempotently saves an available recruitment opportunity.
    void save(String username, Integer jobId);
    // Removes an account-owned saved opportunity.
    void remove(String username, Integer jobId);
}
