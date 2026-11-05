package tanhs.fudn.parttime_hiring_plaform_project.employer;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import static org.junit.jupiter.api.Assertions.*;
import java.time.LocalDateTime;
import org.springframework.security.access.AccessDeniedException;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.ApplicationStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus;
import tanhs.fudn.parttime_hiring_plaform_project.service.application.JobApplicationService;
import tanhs.fudn.parttime_hiring_plaform_project.service.employer.EmployerStoreService;

class EmployerStoreDetailIntegrationTest extends EmployerIntegrationFixture {
    @Autowired EmployerStoreService stores;
    @Autowired JobApplicationService applications;
    // Loads owned store recruitment and staff while rejecting a foreign caller.
    @Test
    void verifiesWorkflow() throws Exception {
        var owner = business();
        var store = store(owner, "Detailed store", true, true);
        var listing = job(store, "First listing", JobStatus.ACTIVE, LocalDateTime.now().plusDays(1));
        var submitted = application(account("candidate"), listing, ApplicationStatus.PENDING);
        applications.updateApplicationStatus(submitted.getApplicationId(), ApplicationStatus.ACCEPTED, null, owner.username());
        database.flush();
        var result = stores.getStoreDetail(owner.username(), store.getStoreId());
        assertEquals(listing.getJobPostId(), result.getJobs().get(0).getJobId());
        assertEquals(1, stores.getStoreEmployees(owner.username(), store.getStoreId()).size());
        var foreign = business();
        assertThrows(AccessDeniedException.class, () -> stores.getStoreDetail(foreign.username(), store.getStoreId()));
    }
}
