package tanhs.fudn.parttime_hiring_plaform_project.auth;
import jakarta.servlet.FilterChain;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmployerStatus;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository;
import tanhs.fudn.parttime_hiring_plaform_project.security.EmployerStatusFilter;
import tanhs.fudn.parttime_hiring_plaform_project.security.SecurityErrorWriter;
import tools.jackson.databind.ObjectMapper;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmployerStatusUnitTest {
    // Rejects employer mutations after business suspension even with valid roles.
    @Test
    void blocksSuspendedEmployerWrites() throws Exception {
        var users = mock(UserRepository.class);
        var employers = mock(EmployerRepository.class);
        when(users.findByUsername("business")).thenReturn(Optional.of(User.builder().id(7L).build()));
        when(employers.findByUserId(7)).thenReturn(Optional.of(
                Employer.builder().status(EmployerStatus.SUSPENDED).build()));
        var filter = new EmployerStatusFilter(users, employers, new SecurityErrorWriter(new ObjectMapper()));
        var request = new MockHttpServletRequest("POST", "/api/employer/jobs");
        var response = new MockHttpServletResponse();
        var chain = mock(FilterChain.class);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                "business", null, List.of(new SimpleGrantedAuthority("ROLE_EMPLOYER"))));
        try {
            filter.doFilter(request, response, chain);
            assertEquals(403, response.getStatus());
            verifyNoInteractions(chain);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }
}
