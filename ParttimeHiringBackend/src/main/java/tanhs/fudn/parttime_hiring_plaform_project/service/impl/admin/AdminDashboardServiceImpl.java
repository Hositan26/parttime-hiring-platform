package tanhs.fudn.parttime_hiring_plaform_project.service.impl.admin;

import lombok.extern.slf4j.Slf4j;
import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminDashboardService;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.admin.dashboard.AdminDashboardStats;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.application.JobApplicationRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.application.RecruitmentInteractionRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.StoreRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerVerificationRepository;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.InteractionKind;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.InteractionStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.VerificationStatus;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final UserRepository userRepository;
    private final EmployerRepository employerRepository;
    private final JobPostRepository jobPostRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final StoreRepository storeRepository;
    private final EmployerVerificationRepository verificationRepository;
    private final RecruitmentInteractionRepository interactionRepository;

    // Counts applications and pending moderation work using aggregate queries.
    @Transactional(readOnly = true)
    public AdminDashboardStats getStats() {
        LocalDateTime firstDayOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        
        return AdminDashboardStats.builder()
                .totalUsers(userRepository.count())
                .totalEmployers(employerRepository.count())
                .totalJobs(jobPostRepository.count())
                .totalApplications(jobApplicationRepository.count())
                .pendingVerifications(verificationRepository.countByVerificationStatus(VerificationStatus.PENDING))
                .pendingStores(storeRepository.countByIsApproved(false))
                .pendingReports(interactionRepository.countByKindAndStatus(InteractionKind.REPORT, InteractionStatus.OPEN))
                .newUsersThisMonth(userRepository.countByCreatedAtAfter(firstDayOfMonth))
                .newEmployersThisMonth(employerRepository.countByCreatedAtAfter(firstDayOfMonth))
                .build();
    }
}
