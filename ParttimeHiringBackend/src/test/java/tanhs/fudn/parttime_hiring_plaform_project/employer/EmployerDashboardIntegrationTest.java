package tanhs.fudn.parttime_hiring_plaform_project.employer;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import static org.junit.jupiter.api.Assertions.*;
import java.time.LocalDateTime;
import java.util.List;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.ApplicationStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus;
import tanhs.fudn.parttime_hiring_plaform_project.service.employer.EmployerDashboardService;

class EmployerDashboardIntegrationTest extends EmployerIntegrationFixture {
    @Autowired EmployerDashboardService dashboard;
    // Counts owned data and excludes closed and foreign listings from expiring jobs.
    @Test
    void verifiesWorkflow() throws Exception {
        var owner = business();
        var open = store(owner, "Open", true, true);
        store(owner, "Paused", true, false);
        var candidate = account("candidate");
        var deadline = LocalDateTime.now().plusDays(2);
        var active = job(open, "Active listing", JobStatus.ACTIVE, deadline);
        var closed = job(open, "Closed listing", JobStatus.CLOSED, deadline);
        application(candidate, active, ApplicationStatus.PENDING);
        application(candidate, closed, ApplicationStatus.REJECTED);
        var foreign = store(business(), "Other", true, true);
        application(candidate, job(foreign, "Foreign listing", JobStatus.ACTIVE, deadline), ApplicationStatus.PENDING);
        database.flush();
        var response = dashboard.getDashboardOverview(owner.username());
        assertEquals(2, response.getTotalStores());
        assertEquals(2, response.getTotalJobs());
        assertEquals(2, response.getTotalApplications());
        assertEquals(1, response.getPendingApplications());
        assertEquals(6, response.getMonthlyStats().size());
        assertEquals(2, response.getMonthlyStats().get(5).getUv());
        assertEquals(2, response.getRecentApplications().size());
        assertEquals(List.of("Active listing"), response.getExpiringJobs().stream().map(item -> item.getName()).toList());
    }
}
