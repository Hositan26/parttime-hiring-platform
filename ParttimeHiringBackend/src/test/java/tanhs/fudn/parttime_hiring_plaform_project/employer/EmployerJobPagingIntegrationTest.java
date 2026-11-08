package tanhs.fudn.parttime_hiring_plaform_project.employer;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import static org.junit.jupiter.api.Assertions.*;
import java.time.LocalDateTime;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus;
import tanhs.fudn.parttime_hiring_plaform_project.service.employer.EmployerJobService;

class EmployerJobPagingIntegrationTest extends EmployerIntegrationFixture {
    @Autowired EmployerJobService jobs;
    // Applies ownership, store, status, and title filters before dividing pages.
    @Test
    void verifiesWorkflow() throws Exception {
        var owner = business();
        var store = store(owner, "Primary", true, true);
        var other = store(owner, "Secondary", true, true);
        var deadline = LocalDateTime.now().plusDays(1);
        job(store, "Cafe morning", JobStatus.ACTIVE, deadline);
        job(store, "Cafe evening", JobStatus.ACTIVE, deadline);
        job(store, "Cafe paused", JobStatus.PAUSED, deadline);
        job(store, "Warehouse", JobStatus.ACTIVE, deadline);
        job(other, "Cafe elsewhere", JobStatus.ACTIVE, deadline);
        database.flush();
        var first = jobs.getEmployerJobs(owner.username(), 0, 1, store.getStoreId(), JobStatus.ACTIVE, "cafe");
        var second = jobs.getEmployerJobs(owner.username(), 1, 1, store.getStoreId(), JobStatus.ACTIVE, "cafe");
        assertEquals(2, first.getTotalElements());
        assertEquals(2, first.getTotalPages());
        assertEquals(1, first.getContent().size());
        assertEquals(1, second.getContent().size());
        assertNotEquals(first.getContent().get(0).getId(), second.getContent().get(0).getId());
    }
}
