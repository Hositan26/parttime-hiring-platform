package tanhs.fudn.parttime_hiring_plaform_project.service.job;

import java.time.LocalDateTime;
import org.springframework.stereotype.Component;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmployerStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;

@Component
public class JobAvailabilityPolicy {
    // Checks whether recruitment is published, active, and within its deadline.
    public boolean isAvailable(JobPost job, LocalDateTime now) {
        return job != null && !Boolean.TRUE.equals(job.getModerationBlocked()) && job.getStatus() == JobStatus.ACTIVE
                && (job.getPublishedAt() == null || !job.getPublishedAt().isAfter(now))
                && (job.getExpiredAt() == null || job.getExpiredAt().isAfter(now))
                && job.getStore() != null && Boolean.TRUE.equals(job.getStore().getIsActive())
                && Boolean.TRUE.equals(job.getStore().getIsApproved())
                && job.getEmployer() != null && job.getEmployer().getStatus() == EmployerStatus.ACTIVE;
    }
}
