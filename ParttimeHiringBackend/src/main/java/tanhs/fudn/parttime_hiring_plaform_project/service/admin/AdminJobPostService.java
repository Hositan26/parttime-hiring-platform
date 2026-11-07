package tanhs.fudn.parttime_hiring_plaform_project.service.admin;

import org.springframework.data.domain.Page;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.jobpost.AdminJobPostResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus;

public interface AdminJobPostService {
    // Searches listing titles within an exact publication state.
    Page<AdminJobPostResponse> getAllJobPosts(int page, int size, JobStatus status, String query);
    // Preserves the existing unfiltered moderation queue contract.
    default Page<AdminJobPostResponse> getAllJobPosts(int page, int size, JobStatus status) {
        return getAllJobPosts(page, size, status, "");
    }
    // Returns private moderation details for any listing state.
    AdminJobPostResponse getDetail(Integer jobId);
    AdminJobPostResponse updateJobPostStatus(Integer jobId, JobStatus status);
    void deleteJobPost(Integer jobId);
}
