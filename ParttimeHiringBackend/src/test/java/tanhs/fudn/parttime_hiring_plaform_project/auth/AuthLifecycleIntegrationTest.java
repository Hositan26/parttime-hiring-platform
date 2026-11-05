package tanhs.fudn.parttime_hiring_plaform_project.auth;

import jakarta.servlet.http.Cookie;
import java.time.Instant;
import java.util.Arrays;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.PasswordResetToken;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.PasswordResetTokenRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.security.TokenDigests;
import tools.jackson.databind.ObjectMapper;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthLifecycleIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired UserRepository users;
    @Autowired PasswordResetTokenRepository resets;
    @Autowired tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminUserService administration;

    // Allows a password-authenticated employer to open the recruitment dashboard.
    @Test
    void employerLoginOpensDashboard() throws Exception {
        var login = postJson("/api/auth/login", "{\"username\":\"employer\",\"password\":\"employer\"}");
        assertEquals(200, login.getResponse().getStatus());
        mvc.perform(get("/api/employer/dashboard/overview").cookie(cookie(login, "access_token")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.totalStores").isNumber());
    }

    // Revokes employer dashboard access and refresh credentials after logout.
    @Test
    void employerLogoutRevokesSession() throws Exception {
        var login = postJson("/api/auth/login", "{\"username\":\"employer\",\"password\":\"employer\"}");
        var access = cookie(login, "access_token");
        var refresh = cookie(login, "refresh_token");
        mvc.perform(get("/api/employer/dashboard/overview").cookie(access)).andExpect(status().isOk());
        assertEquals(200, postJson("/api/auth/logout", "{}", access, refresh).getResponse().getStatus());
        mvc.perform(get("/api/employer/dashboard/overview").cookie(access)).andExpect(status().isUnauthorized());
        assertEquals(401, postJson("/api/auth/refresh", "{}", refresh).getResponse().getStatus());
    }

    // Registers, authenticates, refreshes, and revokes a browser session end to end.
    @Test
    void completesAccountSessionLifecycle() throws Exception {
        String username = register();
        var login = postJson("/api/auth/login", "{\"username\":\"" + username + "\",\"password\":\"StrongPass123\"}");
        assertEquals(200, login.getResponse().getStatus());
        var access = cookie(login, "access_token");
        var refresh = cookie(login, "refresh_token");
        mvc.perform(get("/api/users/me").cookie(access)).andExpect(status().isOk());
        var renewed = postJson("/api/auth/refresh", "{}", refresh);
        assertEquals(200, renewed.getResponse().getStatus());
        var nextAccess = cookie(renewed, "access_token");
        var nextRefresh = cookie(renewed, "refresh_token");
        assertNotEquals(refresh.getValue(), nextRefresh.getValue());
        assertEquals(200, postJson("/api/auth/logout", "{}", nextAccess, nextRefresh).getResponse().getStatus());
        mvc.perform(get("/api/users/me").cookie(nextAccess)).andExpect(status().isUnauthorized());
        assertEquals(401, postJson("/api/auth/refresh", "{}", nextRefresh).getResponse().getStatus());
    }

    // Revokes the successor refresh credential when an old credential is replayed.
    @Test
    void detectsRefreshReplay() throws Exception {
        String username = register();
        var login = postJson("/api/auth/login", "{\"username\":\"" + username + "\",\"password\":\"StrongPass123\"}");
        var old = cookie(login, "refresh_token");
        var renewed = postJson("/api/auth/refresh", "{}", old);
        assertEquals(200, renewed.getResponse().getStatus());
        assertEquals(401, postJson("/api/auth/refresh", "{}", old).getResponse().getStatus());
        assertEquals(401, postJson("/api/auth/refresh", "{}", cookie(renewed, "refresh_token")).getResponse().getStatus());
        mvc.perform(get("/api/users/me").cookie(cookie(renewed, "access_token"))).andExpect(status().isUnauthorized());
    }

    // Enforces role checks and exposes only public account fields.
    @Test
    void rejectsCandidateAccessToPrivilegedResources() throws Exception {
        String username = register();
        var login = postJson("/api/auth/login", "{\"username\":\"" + username + "\",\"password\":\"StrongPass123\"}");
        var access = cookie(login, "access_token");
        mvc.perform(get("/api/admin/users").cookie(access)).andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        mvc.perform(get("/api/employer/stores").cookie(access)).andExpect(status().isForbidden());
        mvc.perform(get("/api/users/applications/my-applications").cookie(access)).andExpect(status().isOk());
        assertFalse(login.getResponse().getContentAsString().contains("StrongPass123"));
    }

    // Keeps immutable identity valid after an authenticated username update.
    @Test
    void preservesSessionAfterUsernameChange() throws Exception {
        String username = register();
        var login = postJson("/api/auth/login", "{\"username\":\"" + username + "\",\"password\":\"StrongPass123\"}");
        var user = users.findByUsername(username).orElseThrow();
        user.setUsername(username + "_new");
        users.save(user);
        mvc.perform(get("/api/users/me").cookie(cookie(login, "access_token")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.result.username").value(username + "_new"));
    }

    // Consumes reset credentials once and rejects existing access tokens afterward.
    @Test
    void resetsPasswordAndRevokesSessions() throws Exception {
        String username = register();
        var login = postJson("/api/auth/login", "{\"username\":\"" + username + "\",\"password\":\"StrongPass123\"}");
        var token = new PasswordResetToken();
        token.setTokenHash(TokenDigests.hash("reset-test-token"));
        token.setUser(users.findByUsername(username).orElseThrow());
        token.setExpiresAt(Instant.now().plusSeconds(600));
        resets.save(token);
        String payload = "{\"token\":\"reset-test-token\",\"password\":\"UpdatedPass123\"}";
        assertEquals(200, postJson("/api/auth/reset-password", payload).getResponse().getStatus());
        assertEquals(400, postJson("/api/auth/reset-password", payload).getResponse().getStatus());
        mvc.perform(get("/api/users/me").cookie(cookie(login, "access_token"))).andExpect(status().isUnauthorized());
        assertEquals(401, postJson("/api/auth/refresh", "{}", cookie(login, "refresh_token")).getResponse().getStatus());
    }

    // Blocks previously issued cookies after administrators disable an account.
    @Test
    void blocksOldCookiesAfterAccountBan() throws Exception {
        String username = register();
        var login = postJson("/api/auth/login", "{\"username\":\"" + username + "\",\"password\":\"StrongPass123\"}");
        Long id = users.findByUsername(username).orElseThrow().getId();
        administration.banUser(id);
        mvc.perform(get("/api/users/me").cookie(cookie(login, "access_token"))).andExpect(status().isUnauthorized());
        administration.unbanUser(id);
        mvc.perform(get("/api/users/me").cookie(cookie(login, "access_token"))).andExpect(status().isUnauthorized());
    }
    // Submits each mutation with the application's real browser CSRF exchange.
    private MvcResult postJson(String path, String body, Cookie... sessionCookies) throws Exception {
        var csrf = mvc.perform(get("/api/auth/csrf")).andExpect(status().isOk()).andReturn();
        String value = mapper.readTree(csrf.getResponse().getContentAsString()).get("result").asText();
        Cookie[] cookies = Arrays.copyOf(sessionCookies, sessionCookies.length + 1);
        cookies[sessionCookies.length] = csrf.getResponse().getCookie("XSRF-TOKEN");
        return mvc.perform(post(path).cookie(cookies).header("X-XSRF-TOKEN", value)
                .contentType("application/json").content(body)).andReturn();
    }

    // Creates an isolated candidate account without touching development MySQL.
    private String register() throws Exception {
        String username = "candidate_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        var result = postJson("/api/auth/register", "{\"username\":\"" + username
                + "\",\"password\":\"StrongPass123\",\"displayName\":\"Candidate\"}");
        assertEquals(200, result.getResponse().getStatus(), result.getResponse().getContentAsString());
        return username;
    }

    // Retrieves browser credentials without writing token values to test logs.
    private Cookie cookie(MvcResult result, String name) {
        Cookie cookie = result.getResponse().getCookie(name);
        assertNotNull(cookie, "Expected browser cookie " + name);
        return cookie;
    }
}
