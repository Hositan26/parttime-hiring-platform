package tanhs.fudn.parttime_hiring_plaform_project.user;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.util.UriComponentsBuilder;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("test")
class GoogleAuthorizationRedirectTest {
    @Autowired MockMvc mvc;
    // Uses configured client credentials and state without exposing application session tokens.
    @Test
    void redirectsUsingConfiguredGoogleClient() throws Exception {
        var response = mvc.perform(get("/oauth2/authorization/google")).andExpect(status().is3xxRedirection()).andReturn().getResponse();
        String location = response.getHeader("Location");
        assertNotNull(location);
        var uri = UriComponentsBuilder.fromUriString(location).build();
        assertEquals("accounts.google.com", uri.getHost());
        var query = uri.getQueryParams();
        assertEquals("test-client", query.getFirst("client_id"));
        assertEquals("code", query.getFirst("response_type"));
        assertTrue(query.getFirst("redirect_uri").endsWith("/login/oauth2/code/google"));
        assertNotNull(query.getFirst("state"));
        assertFalse(location.contains("access_token"));
        assertFalse(location.contains("refresh_token"));
    }
}
