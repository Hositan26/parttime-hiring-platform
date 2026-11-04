package tanhs.fudn.parttime_hiring_plaform_project.user;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.application.JobApplicationRequest;
import tanhs.fudn.parttime_hiring_plaform_project.entity.application.JobApplication;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Store;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmployerStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.ApplicationStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.JobApplicationMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.application.JobApplicationRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employment.EmploymentRecordRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.impl.application.JobApplicationServiceImpl;
import tanhs.fudn.parttime_hiring_plaform_project.service.job.JobAvailabilityPolicy;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ApplicationSubmissionTest {
    private final JobApplicationRepository applications = mock(JobApplicationRepository.class);
    private final JobPostRepository jobs = mock(JobPostRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private final JobApplicationServiceImpl service = new JobApplicationServiceImpl(applications, jobs, users,
            mock(EmployerRepository.class), mock(JobApplicationMapper.class), mock(EmploymentRecordRepository.class),
            new JobAvailabilityPolicy());

    // Rejects unavailable recruitment before reading or saving applications.
    @Test
    void rejectsClosedJob() {
        JobPost job = arrange();
        job.setStatus(JobStatus.CLOSED);
        assertThrows(BusinessException.class, () -> service.applyForJob(request(), "candidate"));
        verifyNoInteractions(applications);
    }

    // Persists the authenticated candidate and supplied contact details.
    @Test
    void acceptsAvailableJob() {
        arrange();
        service.applyForJob(request(), "candidate");
        ArgumentCaptor<JobApplication> captor = ArgumentCaptor.forClass(JobApplication.class);
        verify(applications).save(captor.capture());
        assertEquals(1L, captor.getValue().getApplicant().getId());
        assertEquals("0901234567", captor.getValue().getContactPhone());
        assertEquals(ApplicationStatus.PENDING, captor.getValue().getStatus());
    }

    // Prevents a repeated submission from creating a second application.
    @Test
    void rejectsDuplicateApplication() {
        arrange();
        when(applications.existsByJobPost_JobPostIdAndApplicant_Id(10, 1L)).thenReturn(true);
        assertThrows(BusinessException.class, () -> service.applyForJob(request(), "candidate"));
        verify(applications, never()).save(any());
    }

    // Supplies a candidate and an active recruitment opportunity.
    private JobPost arrange() {
        JobPost job = JobPost.builder().jobPostId(10).status(JobStatus.ACTIVE)
                .store(Store.builder().isActive(true).build())
                .employer(Employer.builder().status(EmployerStatus.ACTIVE).build()).build();
        when(users.findByUsername("candidate")).thenReturn(Optional.of(User.builder().id(1L).build()));
        when(jobs.findById(10)).thenReturn(Optional.of(job));
        return job;
    }

    // Supplies the application's contact information.
    private JobApplicationRequest request() {
        return JobApplicationRequest.builder().jobPostId(10).contactPhone("0901234567").build();
    }
}
