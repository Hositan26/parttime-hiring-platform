package tanhs.fudn.parttime_hiring_plaform_project.security;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmployerStatus;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;

@Component
@RequiredArgsConstructor
public class EmployerStatusFilter extends OncePerRequestFilter {
    private static final Set<String> READ_METHODS = Set.of("GET", "HEAD", "OPTIONS");
    private final UserRepository users;
    private final EmployerRepository employers;
    private final SecurityErrorWriter errors;

    // Prevents suspended businesses from modifying employer resources.
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (path.startsWith("/api/employer/") && !READ_METHODS.contains(request.getMethod())
                && authentication != null && authentication.isAuthenticated()
                && authentication.getAuthorities().stream().anyMatch(role -> role.getAuthority().equals("ROLE_EMPLOYER"))) {
            boolean active = users.findByUsername(authentication.getName())
                    .flatMap(user -> employers.findByUserId(user.getId().intValue()))
                    .map(employer -> employer.getStatus() == EmployerStatus.ACTIVE).orElse(false);
            if (!active) {
                errors.write(response, 403, "FORBIDDEN", "An active employer profile is required");
                return;
            }
        }
        chain.doFilter(request, response);
    }
}
