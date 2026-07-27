package tanhs.fudn.parttime_hiring_plaform_project.service.employer;

import tanhs.fudn.parttime_hiring_plaform_project.service.employer.EmployerProfileService;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.EmployerProfileResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer.EmployerProfileUpdateRequest;

public interface EmployerProfileService {
    EmployerProfileResponse getEmployerProfile(String username);
    EmployerProfileResponse updateEmployerProfile(String username, EmployerProfileUpdateRequest request);
}