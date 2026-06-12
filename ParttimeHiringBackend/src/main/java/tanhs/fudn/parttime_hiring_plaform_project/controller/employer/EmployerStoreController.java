package tanhs.fudn.parttime_hiring_plaform_project.controller.employer;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.employer.EmployerStoreService;
import tanhs.fudn.parttime_hiring_plaform_project.dto.employer.store.CreateStoreRequestDTO;
import tanhs.fudn.parttime_hiring_plaform_project.dto.employer.store.UpdateStoreRequestDTO;
import tanhs.fudn.parttime_hiring_plaform_project.dto.employer.store.EmployerStoreDTO;
/**
 * Controller quản lý các chức năng liên quan đến Cửa hàng (Store) dành cho Nhà tuyển dụng.
 * Cung cấp các API RESTful để lấy danh sách, thêm, sửa, xóa và đổi trạng thái cửa hàng.
 */
@RestController
@RequestMapping("/api/v1/employer/stores")
@RequiredArgsConstructor
public class EmployerStoreController {

    private final EmployerStoreService employerStoreService;
    private final UserRepository userRepository;

    /**
     * Xác thực người dùng hiện tại từ token.
     * @param authentication Thông tin xác thực từ Spring Security.
     * @return Đối tượng User tương ứng với token.
     * @throws RuntimeException Nếu không có token hợp lệ hoặc không tìm thấy người dùng.
     */
    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Unauthorized");
        }
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng"));
    }

    /**
     * Lấy danh sách toàn bộ cửa hàng của nhà tuyển dụng.
     * @param authentication Phiên đăng nhập hiện tại.
     * @param sortBy Tiêu chí sắp xếp (ví dụ: "newest").
     * @return Danh sách cửa hàng (EmployerStoreListDTO).
     */
    @GetMapping
    public ResponseEntity<?> getStores(Authentication authentication,
                                       @RequestParam(defaultValue = "newest") String sortBy) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(employerStoreService.getEmployerStores(user.getId().intValue(), sortBy));
    }

    /**
     * Tạo một cửa hàng mới cho nhà tuyển dụng. Cửa hàng mới sẽ ở trạng thái chờ duyệt (INACTIVE).
     * @param authentication Phiên đăng nhập hiện tại.
     * @param request Dữ liệu đầu vào để tạo cửa hàng (tên, địa chỉ, sđt, v.v.).
     * @return Thông tin cửa hàng vừa được tạo.
     */
    @PostMapping
    public ResponseEntity<?> createStore(Authentication authentication, 
                                         @RequestBody CreateStoreRequestDTO request) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(employerStoreService.createStore(user.getId().intValue(), request));
    }

    /**
     * Xem chi tiết thông tin của một cửa hàng cụ thể.
     * @param authentication Phiên đăng nhập hiện tại.
     * @param id ID của cửa hàng cần xem.
     * @return Chi tiết cửa hàng bao gồm cả danh sách tin tuyển dụng (EmployerStoreDetailDTO).
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getStoreDetail(Authentication authentication, @PathVariable Integer id) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(employerStoreService.getStoreDetail(user.getId().intValue(), id));
    }

    /**
     * Cập nhật thông tin cơ bản của cửa hàng. Không áp dụng cho cửa hàng đang chờ duyệt.
     * @param authentication Phiên đăng nhập hiện tại.
     * @param id ID của cửa hàng cần cập nhật.
     * @param request Dữ liệu cập nhật.
     * @return Thông báo thành công.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStore(Authentication authentication, 
                                         @PathVariable Integer id, 
                                         @RequestBody UpdateStoreRequestDTO request) {
        User user = getAuthenticatedUser(authentication);
        employerStoreService.updateStore(user.getId().intValue(), id, request);
        return ResponseEntity.ok("Đã cập nhật thông tin cửa hàng thành công");
    }

    /**
     * Xóa cửa hàng. Chỉ xóa được khi cửa hàng chưa có tin tuyển dụng nào.
     * @param authentication Phiên đăng nhập hiện tại.
     * @param id ID của cửa hàng cần xóa.
     * @return Thông báo thành công.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStore(Authentication authentication, @PathVariable Integer id) {
        User user = getAuthenticatedUser(authentication);
        employerStoreService.deleteStore(user.getId().intValue(), id);
        return ResponseEntity.ok("Đã xóa cửa hàng thành công");
    }

    /**
     * Thay đổi trạng thái hoạt động của cửa hàng (Tạm dừng / Mở lại).
     * @param authentication Phiên đăng nhập hiện tại.
     * @param id ID của cửa hàng cần đổi trạng thái.
     * @return Thông tin cửa hàng sau khi cập nhật trạng thái.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> toggleStoreStatus(Authentication authentication, @PathVariable Integer id) {
        User user = getAuthenticatedUser(authentication);
        EmployerStoreDTO updatedStore = employerStoreService.toggleStoreStatus(user.getId().intValue(), id);
        return ResponseEntity.ok(updatedStore);
    }
}
