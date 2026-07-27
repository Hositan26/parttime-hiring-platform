package tanhs.fudn.parttime_hiring_plaform_project.service.application;

import tanhs.fudn.parttime_hiring_plaform_project.service.application.JobApplicationService;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.application.JobApplicationRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.application.JobApplicationResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.application.EmployerApplicationResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.ApplicationStatus;
import java.util.List;

public interface JobApplicationService {
    void applyForJob(JobApplicationRequest request, String username);
    List<JobApplicationResponse> getMyApplications(String username);
    List<EmployerApplicationResponse> getApplicationsForEmployer(String username, Integer storeId, ApplicationStatus status);
    void updateApplicationStatus(Integer applicationId, ApplicationStatus status, String username);
}