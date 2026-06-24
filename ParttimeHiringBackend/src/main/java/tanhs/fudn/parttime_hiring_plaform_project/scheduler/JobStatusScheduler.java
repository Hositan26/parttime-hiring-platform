package tanhs.fudn.parttime_hiring_plaform_project.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class JobStatusScheduler {

    private final JobPostRepository jobPostRepository;

    // Chạy mỗi phút để cập nhật Database gần như Realtime
    @Scheduled(cron = "0 * * * * ?")
    @Transactional
    public void updateExpiredJobs() {
        log.info("Running scheduled task: updateExpiredJobs");
        LocalDateTime now = LocalDateTime.now();
        
        // Find all jobs that are not EXPIRED but expiredAt < now, and update their status
        int updatedCount = jobPostRepository.updateStatusForExpiredJobs(now, JobStatus.EXPIRED);
        
        log.info("Finished updateExpiredJobs. Updated {} jobs to EXPIRED.", updatedCount);
    }
}
