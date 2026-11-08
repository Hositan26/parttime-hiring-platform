package tanhs.fudn.parttime_hiring_plaform_project.admin;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminUserService;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AdminAccountSearchIntegrationTest {
    @Autowired AdminUserService service;
    @Autowired UserRepository users;

    // Refuses self-locking before mutating credentials or account state.
    @Test
    void administratorCannotDisableOwnAccount() {
        var context = org.springframework.security.core.context.SecurityContextHolder.getContext();
        context.setAuthentication(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken("admin", null));
        try {
            var admin = users.findByUsername("admin").orElseThrow();
            assertThrows(tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException.class,
                    () -> service.banUser(admin.getId()));
            assertTrue(users.findById(admin.getId()).orElseThrow().getIsActive());
        } finally {
            org.springframework.security.core.context.SecurityContextHolder.clearContext();
        }
    }

    // Filters names and emails before counting pages and account activity.
    @Test
    void searchesAccountsBeforePaginationAndStatusFiltering() {
        var admin = users.findByUsername("admin").orElseThrow();
        admin.setEmail("admin-search@example.invalid");
        users.saveAndFlush(admin);
        var result = service.getAllUsers(0, 1, "ADMIN-SEARCH@EXAMPLE", true);
        assertEquals(1, result.getTotalElements());
        assertEquals(admin.getId(), result.getContent().get(0).getId());
        assertTrue(service.getAllUsers(0, 10, "admin-search", false).isEmpty());
        assertTrue(service.getAllUsers(0, 10, "unmatched-name", null).isEmpty());
        assertThrows(IllegalArgumentException.class, () -> service.getAllUsers(0, 51, "", null));
    }
}
