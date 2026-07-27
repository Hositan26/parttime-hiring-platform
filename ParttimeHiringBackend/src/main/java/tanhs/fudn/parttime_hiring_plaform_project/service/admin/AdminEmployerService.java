package tanhs.fudn.parttime_hiring_plaform_project.service.admin;

import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminEmployerService;
import org.springframework.data.domain.Page;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.employer.AdminEmployerResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmployerStatus;

public interface AdminEmployerService {
    Page<AdminEmployerResponse> getAllEmployers(int page, int size);
    AdminEmployerResponse updateEmployerStatus(Integer employerId, EmployerStatus status);
}