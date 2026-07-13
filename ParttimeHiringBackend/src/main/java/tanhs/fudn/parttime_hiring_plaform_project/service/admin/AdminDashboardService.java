package tanhs.fudn.parttime_hiring_plaform_project.service.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tanhs.fudn.parttime_hiring_plaform_project.dto.admin.dashboard.AdminDashboardStats;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employment.EmploymentRecordRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final EmployerRepository employerRepository;
    private final JobPostRepository jobPostRepository;
    private final EmploymentRecordRepository employmentRecordRepository;

    public AdminDashboardStats getStats() {
        return AdminDashboardStats.builder()
                .totalUsers(userRepository.count())
                .totalEmployers(employerRepository.count())
                .totalJobs(jobPostRepository.count())
                .totalApplications(employmentRecordRepository.count())
                .build();
    }
}
