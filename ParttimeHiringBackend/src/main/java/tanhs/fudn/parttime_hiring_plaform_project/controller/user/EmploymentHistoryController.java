package tanhs.fudn.parttime_hiring_plaform_project.controller.user;

import java.security.Principal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.EmploymentHistoryResponse;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.EmploymentHistoryService;

@RestController
@RequestMapping("/api/users/employments")
@RequiredArgsConstructor
public class EmploymentHistoryController {
    private final EmploymentHistoryService service;

    // Returns the authenticated account's paginated employment history.
    @GetMapping
    public ResponseEntity<ApiResponse<Page<EmploymentHistoryResponse>>> history(Principal principal,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(ApiResponse.success(service.history(principal.getName(), page, size)));
    }
}
