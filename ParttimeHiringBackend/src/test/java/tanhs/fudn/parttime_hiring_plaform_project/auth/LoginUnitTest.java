package tanhs.fudn.parttime_hiring_plaform_project.auth;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.auth.LoginRequest;
import tanhs.fudn.parttime_hiring_plaform_project.exception.UnauthorizedException;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.AuthMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.RoleRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.security.JwtTokenProvider;
import tanhs.fudn.parttime_hiring_plaform_project.service.impl.auth.AuthServiceImpl;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoginUnitTest {
    @Mock AuthenticationManager authenticationManager;
    @Mock UserRepository userRepository;
    @Mock RoleRepository roleRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtTokenProvider tokenProvider;
    @Mock AuthMapper authMapper;
    @InjectMocks AuthServiceImpl service;

    // Returns a generic failure without exposing authentication internals.
    @Test
    void hidesAuthenticationFailureDetails() {
        var request = new LoginRequest();
        request.setUsername("missing");
        request.setPassword("wrong");
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("internal details"));
        var error = assertThrows(UnauthorizedException.class,
                () -> service.login(request, new MockHttpServletResponse()));
        assertEquals("Invalid username or password", error.getMessage());
        verifyNoInteractions(tokenProvider);
    }
}
