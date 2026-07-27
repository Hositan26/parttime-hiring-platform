package tanhs.fudn.parttime_hiring_plaform_project.service.employer;

import tanhs.fudn.parttime_hiring_plaform_project.service.employer.EmployerJobService;
import org.springframework.data.domain.Page;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer.job.CreateEmployerJobRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer.job.UpdateEmployerJobRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.job.*;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus;
import java.util.List;

public interface EmployerJobService {
    Page<EmployerJobListResponse> getEmployerJobs(String username, int page, int size, Integer storeId, tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus status);
    EmployerJobDetailResponse getEmployerJobDetail(String username, Integer jobId);
    List<EmployerJobCommentResponse> getJobComments(String username, Integer jobId);
    List<EmployerJobApplicantResponse> getJobApplicants(String username, Integer jobId);
    EmployerJobDetailResponse createEmployerJob(String username, CreateEmployerJobRequest request);
    EmployerJobDetailResponse updateEmployerJob(String username, Integer jobId, UpdateEmployerJobRequest request);
    void addJobImage(String username, Integer jobId, String imageUrl);
    void deleteJobImage(String username, Integer jobId, Integer imageId);
    void patchJobStatus(String username, Integer jobId, JobStatus newStatus);
    void deleteJob(String username, Integer jobId);
}