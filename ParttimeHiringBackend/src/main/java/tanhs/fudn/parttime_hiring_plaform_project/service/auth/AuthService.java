package tanhs.fudn.parttime_hiring_plaform_project.service.auth;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.AuthResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.LoginRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.RegisterRequest;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.Role;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.RoleRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.security.JwtTokenProvider;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;

/**
 * Service xử lý các nghiệp vụ liên quan đến xác thực (Đăng ký, Đăng nhập).
 */
@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository,
                       RoleRepository roleRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    /**
     * Xử lý đăng nhập.
     * @param request DTO chứa username và password.
     * @return AuthResponse chứa chuỗi JWT.
     */
    public AuthResponse login(LoginRequest request) {
        // Xác thực người dùng bằng AuthenticationManager
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        // Lưu thông tin vào SecurityContext
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Sinh token
        String jwt = tokenProvider.generateToken(authentication);
        return AuthResponse.builder().token(jwt).build();
    }

    /**
     * Xử lý đăng ký tài khoản mới.
     * @param request DTO chứa username và password mới.
     */
    public void register(RegisterRequest request) {
        // Kiểm tra xem username đã tồn tại chưa
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username đã tồn tại trong hệ thống");
        }

        // Lấy Role USER từ Database, nếu không có tự động tạo mới
        Role userRole = roleRepository.findById("USER")
                .orElseGet(() -> roleRepository.save(new Role("USER", "Default User Role")));

        // Chuyển đổi String dateOfBirth (yyyy-MM-dd) sang LocalDate
        LocalDate dob = null;
        if (request.getDateOfBirth() != null && !request.getDateOfBirth().trim().isEmpty()) {
            dob = LocalDate.parse(request.getDateOfBirth(), DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        }

        // Tạo User mới và mã hoá password
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getDisplayName())
                .dateOfBirth(dob)
                .roles(Collections.singleton(userRole))
                .build();

        userRepository.save(user);
    }
}
