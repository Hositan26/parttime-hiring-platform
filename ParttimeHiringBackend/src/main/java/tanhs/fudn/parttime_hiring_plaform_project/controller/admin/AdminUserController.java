package tanhs.fudn.parttime_hiring_plaform_project.controller.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.user.AdminUserResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;
import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminUserService;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    // Lists accounts using server-side search and activity filtering.
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AdminUserResponse>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String query,
            @RequestParam(required = false) Boolean active
    ) {
        Page<AdminUserResponse> users = adminUserService.getAllUsers(page, size, query, active);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    // Disables another account and revokes its existing sessions.
    @PutMapping("/{id}/ban")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> banUser(@PathVariable Long id) {
        adminUserService.banUser(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // Restores account access while keeping previous credentials revoked.
    @PutMapping("/{id}/unban")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> unbanUser(@PathVariable Long id) {
        adminUserService.unbanUser(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
