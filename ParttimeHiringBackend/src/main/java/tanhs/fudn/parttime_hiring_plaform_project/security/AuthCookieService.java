package tanhs.fudn.parttime_hiring_plaform_project.security;

import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class AuthCookieService {
    private final boolean secure;

    // Applies environment-specific transport protection to authentication cookies.
    public AuthCookieService(@Value("${app.auth.cookie-secure:true}") boolean secure) {
        this.secure = secure;
    }

    // Writes an HttpOnly access cookie matching the token lifetime.
    public void writeAccess(HttpServletResponse response, String token, long seconds) {
        write(response, "access_token", token, seconds, "/");
    }

    // Removes authentication cookies using their original paths and attributes.
    public void clear(HttpServletResponse response) {
        write(response, "access_token", "", 0, "/");
        write(response, "refresh_token", "", 0, "/");
    }

    // Serializes a host-only authentication cookie without exposing its value.
    public void write(HttpServletResponse response, String name, String value, long seconds, String path) {
        response.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from(name, value)
                .httpOnly(true).secure(secure).sameSite("Lax").path(path)
                .maxAge(Duration.ofSeconds(seconds)).build().toString());
    }
}
