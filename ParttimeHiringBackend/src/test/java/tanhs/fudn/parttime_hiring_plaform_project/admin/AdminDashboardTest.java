package tanhs.fudn.parttime_hiring_plaform_project.admin;

import org.junit.jupiter.api.Test;
import tanhs.fudn.parttime_hiring_plaform_project.service.impl.admin.AdminDashboardServiceImpl;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.StoreRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerVerificationRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.application.JobApplicationRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.application.RecruitmentInteractionRepository;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.VerificationStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.InteractionKind;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.InteractionStatus;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class AdminDashboardTest {
    // Counts submitted applications independently from accepted employment records.
    @Test
    void countsApplicationsAndEachPendingQueue() {
        var users = mock(UserRepository.class);
        var employers = mock(EmployerRepository.class);
        var jobs = mock(JobPostRepository.class);
        var applications = mock(JobApplicationRepository.class);
        var stores = mock(StoreRepository.class);
        var verifications = mock(EmployerVerificationRepository.class);
        var reports = mock(RecruitmentInteractionRepository.class);
        when(applications.count()).thenReturn(17L);
        when(stores.countByIsApproved(false)).thenReturn(3L);
        when(verifications.countByVerificationStatus(VerificationStatus.PENDING)).thenReturn(4L);
        when(reports.countByKindAndStatus(InteractionKind.REPORT, InteractionStatus.OPEN)).thenReturn(5L);
        var result = new AdminDashboardServiceImpl(users, employers, jobs, applications, stores, verifications, reports).getStats();
        assertEquals(17, result.getTotalApplications());
        assertEquals(3, result.getPendingStores());
        assertEquals(4, result.getPendingVerifications());
        assertEquals(5, result.getPendingReports());
    }
}
