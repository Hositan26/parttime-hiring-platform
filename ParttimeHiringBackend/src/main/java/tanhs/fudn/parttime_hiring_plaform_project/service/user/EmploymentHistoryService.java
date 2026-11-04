package tanhs.fudn.parttime_hiring_plaform_project.service.user;

import org.springframework.data.domain.Page;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.EmploymentHistoryResponse;

public interface EmploymentHistoryService {
    // Lists only the authenticated candidate's employment history.
    Page<EmploymentHistoryResponse> history(String username, int page, int size);
}
