package tanhs.fudn.parttime_hiring_plaform_project.service.impl.admin;

import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminDashboardService;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.admin.dashboard.AdminDashboardStats;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employment.EmploymentRecordRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final UserRepository userRepository;
    private final EmployerRepository employerRepository;
    private final JobPostRepository jobPostRepository;
    private final EmploymentRecordRepository employmentRecordRepository;

    public AdminDashboardStats getStats() {
        java.time.LocalDateTime firstDayOfMonth = java.time.LocalDate.now().withDayOfMonth(1).atStartOfDay();
        
        return AdminDashboardStats.builder()
                .totalUsers(userRepository.count())
                .totalEmployers(employerRepository.count())
                .totalJobs(jobPostRepository.count())
                .totalApplications(employmentRecordRepository.count())
                .newUsersThisMonth(userRepository.countByCreatedAtAfter(firstDayOfMonth))
                .newEmployersThisMonth(employerRepository.countByCreatedAtAfter(firstDayOfMonth))
                .build();
    }
}
