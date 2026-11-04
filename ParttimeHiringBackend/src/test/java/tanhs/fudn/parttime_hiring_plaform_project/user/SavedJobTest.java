package tanhs.fudn.parttime_hiring_plaform_project.user;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Store;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmployerStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.JobMapper;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.SavedJobMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.SavedJobRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.impl.user.SavedJobServiceImpl;
import tanhs.fudn.parttime_hiring_plaform_project.service.job.JobAvailabilityPolicy;
import static org.mockito.Mockito.*;

class SavedJobTest {
    // Makes repeated saves idempotent and scopes removal to the authenticated account.
    @Test
    void protectsOwnershipAndUniqueness() {
        UserRepository users = mock(UserRepository.class);
        JobPostRepository jobs = mock(JobPostRepository.class);
        SavedJobRepository saved = mock(SavedJobRepository.class);
        when(users.lockByUsername("candidate")).thenReturn(Optional.of(User.builder().id(1L).build()));
        when(jobs.findById(5)).thenReturn(Optional.of(JobPost.builder().status(JobStatus.ACTIVE)
                .store(Store.builder().isActive(true).build())
                .employer(Employer.builder().status(EmployerStatus.ACTIVE).build()).build()));
        when(saved.existsByUser_IdAndJobPost_JobPostId(1L, 5)).thenReturn(true);
        var service = new SavedJobServiceImpl(users, jobs, saved, mock(JobMapper.class),
                mock(SavedJobMapper.class), new JobAvailabilityPolicy());
        service.save("candidate", 5);
        verify(saved, never()).save(any());
        service.remove("candidate", 5);
        verify(saved).deleteByUser_IdAndJobPost_JobPostId(1L, 5);
    }
}
