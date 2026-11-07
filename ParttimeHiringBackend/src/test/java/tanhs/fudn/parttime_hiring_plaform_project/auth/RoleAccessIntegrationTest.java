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
    @Autowired tanhs.fudn.parttime_hiring_plaform_project.repository.identity.RoleRepository roles;

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

    // Returns JSON unauthorized responses instead of browser login redirects.
    @Test
    void guestReceivesJsonUnauthorized() throws Exception {
        mvc.perform(get("/api/users/me")).andExpect(status().isUnauthorized())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.code").value("UNAUTHORIZED"));
    }
    // Requires employer authentication for direct dashboard and recruitment requests.
    @Test
    void employerRoutesRequireAuthentication() throws Exception {
        mvc.perform(get("/api/employer/dashboard/overview")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/employer/jobs")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/employer/jobs").cookie(cookie("employer"))).andExpect(status().isOk());
    }

    // Rejects anonymous requests across every administration resource group.
    @Test
    void guestsCannotAccessAdministrationResources() throws Exception {
        for (String resource : new String[]{"users", "employers", "stores", "jobs", "categories", "shifts", "reviews", "job-reports", "verifications"}) {
            mvc.perform(get("/api/admin/" + resource)).andExpect(status().isUnauthorized());
            mvc.perform(get("/api/admin/" + resource).cookie(cookie("employer")))
                    .andExpect(status().isForbidden());
        }
    }

    // Rejects candidate authorities across every administration resource group.
    @Test
    @org.springframework.transaction.annotation.Transactional
    void candidatesCannotAccessAdministrationResources() throws Exception {
        var role = roles.findById("USER").orElseGet(() -> roles.save(new tanhs.fudn.parttime_hiring_plaform_project.entity.identity.Role("USER", "Candidate")));
        var candidate = users.save(tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User.builder()
                .username("admin_access_candidate").displayName("Candidate").roles(java.util.Set.of(role)).build());
        var access = new Cookie("access_token", tokens.generateTokenForUser(candidate));
        for (String resource : new String[]{"dashboard/stats", "users", "employers", "stores", "jobs", "categories", "shifts", "reviews", "job-reports", "verifications"}) {
            mvc.perform(get("/api/admin/" + resource).cookie(access)).andExpect(status().isForbidden());
        }
    }

    // Signs test credentials for persisted development identities in isolated H2.
    private Cookie cookie(String username) {
        return new Cookie("access_token", tokens.generateTokenForUser(users.findByUsername(username).orElseThrow()));
    }
}
