package tanhs.fudn.parttime_hiring_plaform_project.auth;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CsrfIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;

    // Blocks state-changing requests that lack browser CSRF protection.
    @Test
    void rejectsUnprotectedLogin() throws Exception {
        mvc.perform(post("/api/auth/login").contentType("application/json")
                .content("{\"username\":\"admin\",\"password\":\"admin\"}"))
                .andExpect(status().isForbidden());
    }

    // Authenticates browsers that supply matching CSRF cookie and header.
    @Test
    void acceptsProtectedLogin() throws Exception {
        var csrf = mvc.perform(get("/api/auth/csrf")).andExpect(status().isOk()).andReturn().getResponse();
        String value = mapper.readTree(csrf.getContentAsString()).get("result").asText();
        var cookie = csrf.getCookie("XSRF-TOKEN");
        assertNotNull(cookie);
        mvc.perform(post("/api/auth/login").cookie(cookie).header("X-XSRF-TOKEN", value)
                .contentType("application/json").content("{\"username\":\"admin\",\"password\":\"admin\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.result.username").value("admin"))
                .andExpect(jsonPath("$.result.token").doesNotExist());
    }
    // Accepts credentialed preflight requests only from configured frontend origins.
    @Test
    void permitsConfiguredFrontendOrigin() throws Exception {
        mvc.perform(options("/api/users/me").header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "PUT")
                .header("Access-Control-Request-Headers", "X-XSRF-TOKEN,Content-Type"))
                .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    // Rejects untrusted websites before they can perform credentialed requests.
    @Test
    void rejectsUntrustedOrigin() throws Exception {
        mvc.perform(options("/api/users/me").header("Origin", "https://untrusted.example")
                .header("Access-Control-Request-Method", "PUT")).andExpect(status().isForbidden());
    }}
