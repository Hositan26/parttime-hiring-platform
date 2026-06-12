package tanhs.fudn.parttime_hiring_plaform_project.service.employer;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.employer.dashboard.*;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.application.JobApplication;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.StoreRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.application.JobApplicationRepository;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployerDashboardService {

    private final EmployerRepository employerRepository;
    private final StoreRepository storeRepository;
    private final JobPostRepository jobPostRepository;
    private final JobApplicationRepository jobApplicationRepository;

    public DashboardOverviewDTO getDashboardOverview(Integer userId) {
        Employer employer = employerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Employer not found"));
        Integer employerId = employer.getEmployerId();

        long totalStores = storeRepository.countByEmployer_EmployerId(employerId);
        long totalJobs = jobPostRepository.countByEmployer_EmployerId(employerId);
        long totalApplications = jobApplicationRepository.countByEmployerId(employerId);
        long pendingApplications = jobApplicationRepository.countByEmployerIdAndStatus(employerId, "PENDING");

        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        List<Object[]> monthlyData = jobApplicationRepository.countApplicationsByMonth(employerId, sixMonthsAgo);
        List<MonthlyStatDTO> monthlyStats = new ArrayList<>();
        
        for (int i = 5; i >= 0; i--) {
            LocalDateTime month = LocalDateTime.now().minusMonths(i);
            int monthValue = month.getMonthValue();
            long count = 0;
            for (Object[] data : monthlyData) {
                if (((Number) data[0]).intValue() == monthValue) {
                    count = ((Number) data[1]).longValue();
                    break;
                }
            }
            monthlyStats.add(new MonthlyStatDTO("Tháng " + monthValue, count));
        }

        List<JobApplication> recentApps = jobApplicationRepository.findRecentApplicationsByEmployerId(employerId, PageRequest.of(0, 5));
        List<RecentApplicationDTO> recentApplications = recentApps.stream().map(app -> {
            String timeAgo = getTimeAgo(app.getAppliedAt());
            return RecentApplicationDTO.builder()
                    .name(app.getApplicant().getDisplayName())
                    .role(app.getJobPost().getTitle())
                    .store(app.getJobPost().getStore().getStoreName())
                    .time(timeAgo)
                    .status("PENDING".equals(app.getStatus()) ? "Chờ xử lý" : ("ACCEPTED".equals(app.getStatus()) ? "Đã nhận" : "Từ chối"))
                    .isPending("PENDING".equals(app.getStatus()))
                    .img(app.getApplicant().getAvatarUrl() != null ? app.getApplicant().getAvatarUrl() : "https://i.pravatar.cc/150")
                    .build();
        }).collect(Collectors.toList());

        List<JobPost> expiring = jobPostRepository.findExpiringJobsByEmployerId(employerId, PageRequest.of(0, 5));
        List<ExpiringJobDTO> expiringJobs = expiring.stream().map(job -> {
            long daysLeft = ChronoUnit.DAYS.between(LocalDateTime.now(), job.getExpiredAt());
            return ExpiringJobDTO.builder()
                    .name(job.getTitle())
                    .store(job.getStore().getStoreName())
                    .expire(daysLeft > 0 ? "Còn " + daysLeft + " ngày" : "Hết hạn hôm nay")
                    .logo("https://cdn-icons-png.flaticon.com/512/3268/3268832.png")
                    .build();
        }).collect(Collectors.toList());

        String verificationStatus = "ACTIVE".equals(employer.getStatus()) ? "Đã xác minh" : "Chờ xác minh";
        String verificationDate = employer.getUpdatedAt() != null ? 
                employer.getUpdatedAt().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")) : 
                (employer.getCreatedAt() != null ? employer.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "N/A");

        return DashboardOverviewDTO.builder()
                .totalStores(totalStores)
                .totalJobs(totalJobs)
                .totalApplications(totalApplications)
                .pendingApplications(pendingApplications)
                .verificationStatus(verificationStatus)
                .verificationDate(verificationDate)
                .monthlyStats(monthlyStats)
                .recentApplications(recentApplications)
                .expiringJobs(expiringJobs)
                .build();
    }

    private String getTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        long minutes = ChronoUnit.MINUTES.between(dateTime, LocalDateTime.now());
        if (minutes < 60) return minutes + " phút trước";
        long hours = ChronoUnit.HOURS.between(dateTime, LocalDateTime.now());
        if (hours < 24) return hours + " giờ trước";
        long days = ChronoUnit.DAYS.between(dateTime, LocalDateTime.now());
        return days + " ngày trước";
    }
}
