package tanhs.fudn.parttime_hiring_plaform_project.security;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import tanhs.fudn.parttime_hiring_plaform_project.exception.RateLimitException;

@Component
@RequiredArgsConstructor
public class AuthRateLimitFilter extends OncePerRequestFilter {
    private static final Set<String> SENSITIVE_PATHS = Set.of("/api/auth/login", "/api/auth/register",
            "/api/auth/forgot-password", "/api/auth/reset-password",
            "/api/employers/verifications/email/send-otp", "/api/employers/verifications/email/verify-otp");
    private final AttemptRateLimiter limiter;
    private final SecurityErrorWriter errors;

    // Throttles sensitive requests using the actual peer address rather than spoofed headers.
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        if ("POST".equals(request.getMethod()) && SENSITIVE_PATHS.contains(path)) {
            try {
                limiter.check(path, request.getRemoteAddr(), 20, 900);
            } catch (RateLimitException exception) {
                response.setHeader("Retry-After", "900");
                errors.write(response, 429, "RATE_LIMITED", exception.getMessage());
                return;
            }
        }
        chain.doFilter(request, response);
    }
}
