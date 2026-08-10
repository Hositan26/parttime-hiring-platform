package tanhs.fudn.parttime_hiring_plaform_project.service.admin;

import org.springframework.data.domain.Page;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.jobpost.AdminJobPostResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus;

public interface AdminJobPostService {
    Page<AdminJobPostResponse> getAllJobPosts(int page, int size, JobStatus status);
    AdminJobPostResponse updateJobPostStatus(Integer jobId, JobStatus status);
    void deleteJobPost(Integer jobId);
}
