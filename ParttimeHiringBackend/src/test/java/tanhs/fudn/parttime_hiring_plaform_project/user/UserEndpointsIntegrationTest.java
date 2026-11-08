package tanhs.fudn.parttime_hiring_plaform_project.user;

import jakarta.persistence.EntityManager;
import jakarta.servlet.http.Cookie;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.Role;
import tanhs.fudn.parttime_hiring_plaform_project.security.JwtTokenProvider;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("test") @Transactional
class UserEndpointsIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired EntityManager database;
    @Autowired JwtTokenProvider tokens;

    // Serializes private pages consistently and denies candidate access to moderation reports.
    @Test
    void exposesAccountScopedEnvelopes() throws Exception {
        Role role = database.find(Role.class, "USER");
        if (role == null) { role = new Role("USER", "Candidate"); database.persist(role); }
        User user = User.builder().username("endpoint_candidate").displayName("Endpoint candidate").roles(Set.of(role)).build();
        database.persist(user);
        database.flush();
        Cookie access = new Cookie("access_token", tokens.generateTokenForUser(user));
        for (String path : new String[]{"/api/users/employments", "/api/users/saved-jobs", "/api/users/notifications", "/api/recruitment/reports"}) {
            mvc.perform(get(path).cookie(access)).andExpect(status().isOk()).andExpect(jsonPath("$.result.content").isArray())
                    .andExpect(jsonPath("$.result.totalElements").value(0));
        }
        mvc.perform(get("/api/candidate-profiles/me").cookie(access)).andExpect(status().isOk())
                .andExpect(jsonPath("$.result.displayName").value("Endpoint candidate"))
                .andExpect(jsonPath("$.result.resumeData").doesNotExist());
        mvc.perform(get("/api/admin/job-reports").cookie(access)).andExpect(status().isForbidden());
        mvc.perform(get("/api/jobs/page").param("size", "100")).andExpect(status().isBadRequest());
    }

    // Requires authentication for candidate documents, history, messages, and notifications.
    @Test
    void rejectsAnonymousPrivateRequests() throws Exception {
        for (String path : new String[]{"/api/candidate-profiles/me", "/api/users/employments", "/api/users/notifications", "/api/recruitment/reports"}) {
            mvc.perform(get(path)).andExpect(status().isUnauthorized()).andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
        }
    }
}
