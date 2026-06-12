package tanhs.fudn.parttime_hiring_plaform_project.service.employer;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.employer.dashboard.*;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.application.JobApplication;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.DashboardMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.StoreRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.application.JobApplicationRepository;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmployerDashboardService {

    UserRepository userRepository;
    EmployerRepository employerRepository;
    StoreRepository storeRepository;
    JobPostRepository jobPostRepository;
    JobApplicationRepository jobApplicationRepository;
    DashboardMapper dashboardMapper;

    private Employer getEmployerByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng."));
        return employerRepository.findByUserId(user.getId().intValue())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin nhà tuyển dụng."));
    }

    @Transactional(readOnly = true)
    public DashboardOverviewResponse getDashboardOverview(String username) {
        log.info("Lấy thông tin tổng quan Dashboard cho username: {}", username);
        Employer employer = getEmployerByUsername(username);
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
            return dashboardMapper.toRecentApplicationDTO(app, timeAgo);
        }).collect(Collectors.toList());

        List<JobPost> expiring = jobPostRepository.findExpiringJobsByEmployerId(employerId, PageRequest.of(0, 5));
        List<ExpiringJobDTO> expiringJobs = expiring.stream().map(job -> {
            long daysLeft = ChronoUnit.DAYS.between(LocalDateTime.now(), job.getExpiredAt());
            String expireStr = daysLeft > 0 ? "Còn " + daysLeft + " ngày" : "Hết hạn hôm nay";
            return dashboardMapper.toExpiringJobDTO(job, expireStr);
        }).collect(Collectors.toList());

        return dashboardMapper.toDashboardOverviewResponse(
                employer, totalStores, totalJobs, totalApplications, pendingApplications,
                monthlyStats, recentApplications, expiringJobs);
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
