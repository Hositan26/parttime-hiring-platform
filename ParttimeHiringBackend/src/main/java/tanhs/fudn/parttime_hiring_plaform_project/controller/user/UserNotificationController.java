package tanhs.fudn.parttime_hiring_plaform_project.controller.user;

import java.security.Principal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.UserNotificationResponse;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.UserNotificationService;

@RestController @RequestMapping("/api/users/notifications") @RequiredArgsConstructor
public class UserNotificationController {
    private final UserNotificationService service;
    // Lists a bounded page of the authenticated account's notifications.
    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserNotificationResponse>>> list(Principal principal,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(service.list(principal.getName(), page, size)));
    }
    // Marks a notification read after checking recipient ownership.
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<String>> read(Principal principal, @PathVariable Long id) {
        service.read(principal.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Notification read"));
    }
}
