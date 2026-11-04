package tanhs.fudn.parttime_hiring_plaform_project.auth;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletResponse;
import tanhs.fudn.parttime_hiring_plaform_project.security.AuthCookieService;
import static org.junit.jupiter.api.Assertions.*;

class CookieUnitTest {
    // Removes both cookies and retains production transport protections.
    @Test
    void clearsSessionCookies() {
        var response = new MockHttpServletResponse();
        new AuthCookieService(true).clear(response);
        assertEquals(2, response.getHeaders("Set-Cookie").size());
        response.getHeaders("Set-Cookie").forEach(value -> {
            assertTrue(value.contains("Max-Age=0"));
            assertTrue(value.contains("HttpOnly"));
            assertTrue(value.contains("Secure"));
            assertTrue(value.contains("SameSite=Lax"));
        });
    }
}
