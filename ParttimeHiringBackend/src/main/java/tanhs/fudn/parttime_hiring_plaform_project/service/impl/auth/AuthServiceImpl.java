package tanhs.fudn.parttime_hiring_plaform_project.service.impl.auth;

import jakarta.servlet.http.HttpServletResponse;
import java.time.DateTimeException;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Locale;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.auth.LoginRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.auth.RegisterRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.auth.LoginResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.Role;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.exception.UnauthorizedException;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.AuthMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.RoleRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.security.AttemptRateLimiter;
import tanhs.fudn.parttime_hiring_plaform_project.security.AuthCookieService;
import tanhs.fudn.parttime_hiring_plaform_project.service.auth.AuthService;
import tanhs.fudn.parttime_hiring_plaform_project.service.auth.AuthSessionService;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthServiceImpl implements AuthService {
    AuthenticationManager authenticationManager;
    AttemptRateLimiter limiter;
    UserRepository userRepository;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;
    AuthSessionService sessionService;
    AuthCookieService cookieService;
    AuthMapper authMapper;

    // Authenticates credentials without disclosing account existence or internal failures.
    @Transactional
    public LoginResponse login(LoginRequest request, HttpServletResponse response) {
        String username = request.getUsername().trim();
        limiter.check("login-account", username.toLowerCase(Locale.ROOT), 10, 900);
        var user = userRepository.lockByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("Invalid username or password"));
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, request.getPassword()));
        } catch (AuthenticationException exception) {
            throw new UnauthorizedException("Invalid username or password");
        }
        sessionService.start(user, response);
        return authMapper.toLoginResponse(user);
    }

    // Registers validated account details with default user privileges.
    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("Username is already registered");
        }
        validateBirthDate(request.getDateOfBirth());
        var user = authMapper.toUser(request);
        user.setDisplayName(request.getDisplayName().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(normalizedEmail(request.getEmail()));
        Role userRole = roleRepository.findById("USER")
                .orElseGet(() -> roleRepository.save(new Role("USER", "Default User Role")));
        user.setRoles(Collections.singleton(userRole));
        userRepository.save(user);
    }

    // Normalizes optional email addresses and rejects existing account ownership.
    private String normalizedEmail(String value) {
        if (value == null || value.isBlank()) return null;
        String email = value.trim().toLowerCase(Locale.ROOT);
        if (userRepository.findByEmail(email).isPresent()) throw new BusinessException("Email is already registered");
        return email;
    }

    // Rejects malformed or future birth dates before mapping registration data.
    private void validateBirthDate(String value) {
        if (value == null || value.isBlank()) return;
        try {
            if (LocalDate.parse(value).isAfter(LocalDate.now())) {
                throw new BusinessException("Birth date must not be in the future");
            }
        } catch (DateTimeException exception) {
            throw new BusinessException("Invalid birth date");
        }
    }

    // Clears the browser context when credentials have already been revoked.
    public void logout(HttpServletResponse response) {
        cookieService.clear(response);
        SecurityContextHolder.clearContext();
    }
}
