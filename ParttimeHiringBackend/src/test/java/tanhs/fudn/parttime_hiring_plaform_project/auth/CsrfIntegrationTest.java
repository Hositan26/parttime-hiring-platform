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
}
