package tanhs.fudn.parttime_hiring_plaform_project.service.employment;

import tanhs.fudn.parttime_hiring_plaform_project.service.employment.EmployerEmploymentService;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer.UpdateEmploymentStatusRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.EmployerEmploymentResponse;
import java.util.List;

public interface EmployerEmploymentService {
    List<EmployerEmploymentResponse> getEmploymentsByStore(Integer storeId, String username);
    List<EmployerEmploymentResponse> getAllEmployments(String username);
    void updateEmploymentStatus(Integer recordId, UpdateEmploymentStatusRequest request, String username);
}