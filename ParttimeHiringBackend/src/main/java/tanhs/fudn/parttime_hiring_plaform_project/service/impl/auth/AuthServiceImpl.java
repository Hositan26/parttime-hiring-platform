package tanhs.fudn.parttime_hiring_plaform_project.service.impl.auth;

import tanhs.fudn.parttime_hiring_plaform_project.service.auth.AuthService;


import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletResponse;

import tanhs.fudn.parttime_hiring_plaform_project.dto.response.auth.LoginResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.auth.LoginRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.auth.RegisterRequest;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.Role;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.RoleRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.security.JwtTokenProvider;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthServiceImpl implements AuthService {

    AuthenticationManager authenticationManager;
    UserRepository userRepository;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;
    JwtTokenProvider tokenProvider;
    tanhs.fudn.parttime_hiring_plaform_project.mapper.AuthMapper authMapper;

    // Authenticates credentials without disclosing internal authentication errors.
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request, HttpServletResponse response) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (org.springframework.security.core.AuthenticationException e) {

            throw new tanhs.fudn.parttime_hiring_plaform_project.exception.UnauthorizedException("Invalid username or password");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);

        response.addHeader("Set-Cookie", "access_token=" + jwt + "; HttpOnly; Path=/; Max-Age=" + (7 * 24 * 60 * 60) + "; SameSite=Lax");

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return authMapper.toLoginResponse(user);
    }

    // Registers a validated account with the default user role.
    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException("Username is already registered");
        }

        Role userRole = roleRepository.findById("USER")
                .orElseGet(() -> roleRepository.save(new Role("USER", "Default User Role")));

        LocalDate dob = null;
        if (request.getDateOfBirth() != null && !request.getDateOfBirth().trim().isEmpty()) {
            try {
                dob = LocalDate.parse(request.getDateOfBirth());
            } catch (java.time.DateTimeException exception) {
                throw new tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException("Invalid birth date");
            }
            if (dob.isAfter(LocalDate.now())) {
                throw new tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException("Birth date must not be in the future");
            }
        }

        User user = authMapper.toUser(request);
        user.setDisplayName(request.getDisplayName().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(Collections.singleton(userRole));
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String email = request.getEmail().trim().toLowerCase(java.util.Locale.ROOT);
            if (userRepository.findByEmail(email).isPresent()) {
                throw new tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException("Email is already registered");
            }
            user.setEmail(email);
        }

        userRepository.save(user);
    }
    
    public void logout(HttpServletResponse response) {
        response.addHeader("Set-Cookie", "access_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax");
    }
}

