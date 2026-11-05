package tanhs.fudn.parttime_hiring_plaform_project.employer;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import static org.junit.jupiter.api.Assertions.*;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus;
import tanhs.fudn.parttime_hiring_plaform_project.service.employer.EmployerStoreService;

class EmployerStoreListingIntegrationTest extends EmployerIntegrationFixture {
    @Autowired EmployerStoreService stores;
    // Counts all approval states and orders stores by their recruitment totals.
    @Test
    void verifiesWorkflow() throws Exception {
        var owner = business();
        var active = store(owner, "Active", true, true);
        store(owner, "Paused", true, false);
        store(owner, "Pending", false, false);
        store(business(), "Foreign", true, true);
        job(active, "Fixture listing", JobStatus.ACTIVE, LocalDateTime.now().plusDays(1));
        database.flush();
        var result = stores.getEmployerStores(owner.username(), "jobs");
        assertEquals(3, result.getTotalStores());
        assertEquals(1, result.getActiveStores());
        assertEquals(2, result.getInactiveStores());
        assertEquals(active.getStoreId(), result.getStores().get(0).getStoreId());
        assertEquals(Set.of("ACTIVE", "PAUSED", "PENDING"),
                result.getStores().stream().map(item -> item.getStatus()).collect(Collectors.toSet()));
    }
}
