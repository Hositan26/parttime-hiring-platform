package tanhs.fudn.parttime_hiring_plaform_project.user;

import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Store;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmployerStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.service.job.JobAvailabilityPolicy;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JobAvailabilityPolicyTest {
    private final JobAvailabilityPolicy policy = new JobAvailabilityPolicy();
    private final LocalDateTime now = LocalDateTime.of(2026, 11, 4, 12, 0);

    // Allows published active jobs without a deadline.
    @Test
    void acceptsAvailableJob() {
        assertTrue(policy.isAvailable(job(), now));
    }

    // Treats the deadline itself as closed and future publication as unavailable.
    @Test
    void enforcesPublicationAndExpiryBoundaries() {
        JobPost job = job();
        job.setExpiredAt(now);
        assertFalse(policy.isAvailable(job, now));
        job.setExpiredAt(now.plusSeconds(1));
        assertTrue(policy.isAvailable(job, now));
        job.setPublishedAt(now.plusSeconds(1));
        assertFalse(policy.isAvailable(job, now));
    }

    // Rejects closed recruitment and inactive or missing business information.
    @Test
    void rejectsUnavailableBusiness() {
        JobPost job = job();
        job.setStatus(JobStatus.CLOSED);
        assertFalse(policy.isAvailable(job, now));
        job.setStatus(JobStatus.ACTIVE);
        job.getStore().setIsActive(false);
        assertFalse(policy.isAvailable(job, now));
        job.getStore().setIsActive(true);
        job.getEmployer().setStatus(null);
        assertFalse(policy.isAvailable(job, now));
        assertFalse(policy.isAvailable(null, now));
    }

    // Builds a recruitable job for boundary checks.
    private JobPost job() {
        return JobPost.builder().status(JobStatus.ACTIVE)
                .store(Store.builder().isActive(true).isApproved(true).build())
                .employer(Employer.builder().status(EmployerStatus.ACTIVE).build()).build();
    }
}
