package tanhs.fudn.parttime_hiring_plaform_project.auth;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.security.JwtTokenProvider;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RoleAccessIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired UserRepository users;
    @Autowired JwtTokenProvider tokens;

    // Allows administrators authenticated through real access cookies.
    @Test
    void administratorCanReadUsers() throws Exception {
        mvc.perform(get("/api/admin/users").cookie(cookie("admin"))).andExpect(status().isOk());
    }

    // Prevents employer identities from accessing administration resources.
    @Test
    void employerCannotReadAdminUsers() throws Exception {
        mvc.perform(get("/api/admin/users").cookie(cookie("employer"))).andExpect(status().isForbidden());
    }

    // Prevents employer-only identities from accessing candidate application history.
    @Test
    void employerCannotReadCandidateApplications() throws Exception {
        mvc.perform(get("/api/users/applications/my-applications").cookie(cookie("employer")))
                .andExpect(status().isForbidden());
    }

    // Signs test credentials for persisted development identities in isolated H2.
    private Cookie cookie(String username) {
        return new Cookie("access_token", tokens.generateTokenForUser(users.findByUsername(username).orElseThrow()));
    }
}
