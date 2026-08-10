package tanhs.fudn.parttime_hiring_plaform_project.service.admin;

import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminUserService;
import org.springframework.data.domain.Page;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.user.AdminUserResponse;

public interface AdminUserService {
    Page<AdminUserResponse> getAllUsers(int page, int size);
    void banUser(Long id);
    void unbanUser(Long id);
}