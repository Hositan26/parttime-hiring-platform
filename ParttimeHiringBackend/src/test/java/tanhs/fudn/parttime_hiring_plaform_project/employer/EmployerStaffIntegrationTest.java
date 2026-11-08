package tanhs.fudn.parttime_hiring_plaform_project.employer;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import static org.junit.jupiter.api.Assertions.*;
import java.time.LocalDateTime;
import java.util.List;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer.UpdateEmploymentStatusRequest;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.ApplicationStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.WorkStatus;
import tanhs.fudn.parttime_hiring_plaform_project.service.application.JobApplicationService;
import tanhs.fudn.parttime_hiring_plaform_project.service.employment.EmployerEmploymentService;

class EmployerStaffIntegrationTest extends EmployerIntegrationFixture {
    @Autowired JobApplicationService applications;
    @Autowired EmployerEmploymentService staff;
    // Lists staff across owned branches and preserves terminated records in history.
    @Test
    void verifiesWorkflow() throws Exception {
        var owner = business();
        var first = store(owner, "First", true, true);
        var second = store(owner, "Second", true, true);
        var deadline = LocalDateTime.now().plusDays(1);
        var a = application(account("candidate"), job(first, "First job", JobStatus.ACTIVE, deadline), ApplicationStatus.PENDING);
        var b = application(account("candidate"), job(second, "Second job", JobStatus.ACTIVE, deadline), ApplicationStatus.PENDING);
        applications.updateApplicationStatus(a.getApplicationId(), ApplicationStatus.ACCEPTED, null, owner.username());
        applications.updateApplicationStatus(b.getApplicationId(), ApplicationStatus.ACCEPTED, null, owner.username());
        var record = staff.getEmploymentsByStore(first.getStoreId(), owner.username()).get(0);
        var request = new UpdateEmploymentStatusRequest();
        request.setStatus(WorkStatus.QUIT);
        request.setNote("Candidate resigned");
        staff.updateEmploymentStatus(record.getRecordId(), request, owner.username());
        database.flush();
        var result = staff.getAllEmployments(owner.username());
        assertEquals(2, result.size());
        assertEquals(List.of("QUIT", "WORKING"), result.stream().map(item -> item.getWorkStatus()).sorted().toList());
        assertEquals(1, staff.getEmploymentsByStore(second.getStoreId(), owner.username()).size());
    }
}
