package tanhs.fudn.parttime_hiring_plaform_project.controller.user;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import jakarta.validation.Valid;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.Role;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * API Lấy thông tin chi tiết của người dùng hiện tại đang đăng nhập.
     * @param authentication Đối tượng xác thực chứa thông tin người dùng.
     * @return Đối tượng chứa thông tin người dùng.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .map(user -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("userId", user.getId());
                    response.put("username", user.getUsername());
                    response.put("displayName", user.getDisplayName());
                    response.put("email", user.getEmail());
                    response.put("avatarUrl", user.getAvatarUrl());
                    response.put("dateOfBirth", user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : null);
                    response.put("hasPassword", user.getPassword() != null && !user.getPassword().isEmpty());
                    List<String> roles = user.getRoles().stream()
                            .map(Role::getRoleName)
                            .collect(Collectors.toList());
                    response.put("roles", roles);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * API Cập nhật thông tin của người dùng hiện tại đang đăng nhập.
     * @param authentication Đối tượng xác thực chứa thông tin người dùng.
     * @param payload Dữ liệu cập nhật từ client.
     * @return Đối tượng người dùng sau khi đã cập nhật.
     */
    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(Authentication authentication, @RequestBody Map<String, String> payload) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .map(user -> {
                    if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                        String currentPassword = payload.get("currentPassword");
                        if (currentPassword == null || currentPassword.isEmpty()) {
                            return ResponseEntity.status(400).body(Map.of("message", "Vui lòng nhập mật khẩu xác nhận"));
                        }
                        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                            return ResponseEntity.status(400).body(Map.of("message", "Mật khẩu xác nhận không đúng"));
                        }
                    }

                    if (payload.containsKey("displayName")) {
                        user.setDisplayName(payload.get("displayName"));
                    }
                    if (payload.containsKey("username")) {
                        user.setUsername(payload.get("username"));
                    }
                    if (payload.containsKey("email")) {
                        user.setEmail(payload.get("email"));
                    }
                    if (payload.containsKey("dateOfBirth")) {
                        String dob = payload.get("dateOfBirth");
                        if (dob != null && !dob.isEmpty()) {
                            user.setDateOfBirth(LocalDate.parse(dob));
                        }
                    }
                    
                    try {
                        userRepository.save(user);
                    } catch (org.springframework.dao.DataIntegrityViolationException e) {
                        return ResponseEntity.status(400).body(Map.of("message", "Username hoặc Email đã được sử dụng bởi người khác."));
                    } catch (Exception e) {
                        return ResponseEntity.status(500).body(Map.of("message", "Lỗi máy chủ nội bộ. Vui lòng thử lại."));
                    }

                    Map<String, Object> response = new HashMap<>();
                    response.put("userId", user.getId());
                    response.put("username", user.getUsername());
                    response.put("displayName", user.getDisplayName());
                    response.put("email", user.getEmail());
                    response.put("avatarUrl", user.getAvatarUrl());
                    response.put("dateOfBirth", user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : null);
                    response.put("hasPassword", user.getPassword() != null && !user.getPassword().isEmpty());
                    List<String> roles = user.getRoles().stream()
                            .map(Role::getRoleName)
                            .collect(Collectors.toList());
                    response.put("roles", roles);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

}
