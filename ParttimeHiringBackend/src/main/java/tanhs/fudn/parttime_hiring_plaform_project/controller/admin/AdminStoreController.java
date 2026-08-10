package tanhs.fudn.parttime_hiring_plaform_project.controller.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.store.AdminStoreResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;
import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminStoreService;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/stores")
@RequiredArgsConstructor
public class AdminStoreController {

    private final AdminStoreService adminStoreService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AdminStoreResponse>>> getAllStores(
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<AdminStoreResponse> stores = adminStoreService.getAllStores(page, size, isActive);
        return ResponseEntity.ok(ApiResponse.success(stores));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminStoreResponse>> updateStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, Boolean> payload
    ) {
        Boolean isActive = payload.get("isActive");
        if (isActive == null) {
            throw new IllegalArgumentException("Thiếu trường isActive");
        }
        AdminStoreResponse response = adminStoreService.updateStoreStatus(id, isActive);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteStore(@PathVariable Integer id) {
        adminStoreService.deleteStore(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa cửa hàng/chi nhánh thành công"));
    }
}
