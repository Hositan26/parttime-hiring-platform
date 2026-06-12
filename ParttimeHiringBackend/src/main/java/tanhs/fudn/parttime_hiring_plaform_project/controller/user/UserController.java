package tanhs.fudn.parttime_hiring_plaform_project.controller.user;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tanhs.fudn.parttime_hiring_plaform_project.entity.User;
import tanhs.fudn.parttime_hiring_plaform_project.repository.UserRepository;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

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
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @org.springframework.web.bind.annotation.PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(Authentication authentication, @org.springframework.web.bind.annotation.RequestBody Map<String, String> payload) {
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
                            user.setDateOfBirth(java.time.LocalDate.parse(dob));
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
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
