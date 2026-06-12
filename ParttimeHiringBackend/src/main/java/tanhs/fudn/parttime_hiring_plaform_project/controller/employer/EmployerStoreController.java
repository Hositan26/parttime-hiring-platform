package tanhs.fudn.parttime_hiring_plaform_project.controller.employer;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.security.Principal;

import tanhs.fudn.parttime_hiring_plaform_project.service.employer.EmployerStoreService;
import tanhs.fudn.parttime_hiring_plaform_project.dto.employer.store.CreateStoreRequestDTO;
import tanhs.fudn.parttime_hiring_plaform_project.dto.employer.store.UpdateStoreRequestDTO;
import tanhs.fudn.parttime_hiring_plaform_project.dto.employer.store.EmployerStoreResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.employer.store.EmployerStoreDetailResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.employer.store.EmployerStoreListResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.ApiResponse;

@Slf4j
@RestController
@RequestMapping("/stores")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmployerStoreController {

    EmployerStoreService employerStoreService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<EmployerStoreListResponse>> getStores(
            Principal principal,
            @RequestParam(defaultValue = "newest") String sortBy) {
        
        EmployerStoreListResponse response = employerStoreService.getEmployerStores(principal.getName(), sortBy);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<EmployerStoreResponse>> createStore(
            Principal principal, 
            @Valid @RequestBody CreateStoreRequestDTO request) {
        
        EmployerStoreResponse response = employerStoreService.createStore(principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<EmployerStoreDetailResponse>> getStoreDetail(
            Principal principal, 
            @PathVariable Integer id) {
        
        EmployerStoreDetailResponse response = employerStoreService.getStoreDetail(principal.getName(), id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> updateStore(
            Principal principal, 
            @PathVariable Integer id, 
            @Valid @RequestBody UpdateStoreRequestDTO request) {
        
        employerStoreService.updateStore(principal.getName(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật thông tin cửa hàng thành công"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> deleteStore(
            Principal principal, 
            @PathVariable Integer id) {
        
        employerStoreService.deleteStore(principal.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa cửa hàng thành công"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<EmployerStoreResponse>> toggleStoreStatus(
            Principal principal, 
            @PathVariable Integer id) {
        
        EmployerStoreResponse response = employerStoreService.toggleStoreStatus(principal.getName(), id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
