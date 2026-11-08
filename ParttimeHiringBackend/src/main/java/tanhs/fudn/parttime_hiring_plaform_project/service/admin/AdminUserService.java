package tanhs.fudn.parttime_hiring_plaform_project.service.admin;

import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminUserService;
import org.springframework.data.domain.Page;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.user.AdminUserResponse;

public interface AdminUserService {
    // Lists accounts matching search and optional activity filters.
    Page<AdminUserResponse> getAllUsers(int page, int size, String query, Boolean active);
    // Preserves the existing unfiltered account listing contract.
    default Page<AdminUserResponse> getAllUsers(int page, int size) {
        return getAllUsers(page, size, "", null);
    }
    void banUser(Long id);
    void unbanUser(Long id);
}