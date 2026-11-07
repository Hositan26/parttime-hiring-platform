package tanhs.fudn.parttime_hiring_plaform_project.admin;

import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.springframework.data.domain.PageImpl;
import java.util.List;
import java.util.Optional;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.AdminJobPostMapper;
import tanhs.fudn.parttime_hiring_plaform_project.service.impl.admin.AdminJobPostServiceImpl;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class AdminJobSearchTest {
    // Preserves backend states and exposes closed listing details for moderation.
    @Test
    void searchesExactStateAndReadsUnavailableListing() {
        var jobs = mock(JobPostRepository.class);
        var job = JobPost.builder().jobPostId(1).title("Test job").jobDescription("Full details").status(JobStatus.CLOSED).build();
        when(jobs.searchAdministration(eq("test"), eq(JobStatus.CLOSED), any())).thenReturn(new PageImpl<>(List.of(job)));
        when(jobs.findById(1)).thenReturn(Optional.of(job));
        var service = new AdminJobPostServiceImpl(jobs,
                mock(tanhs.fudn.parttime_hiring_plaform_project.repository.application.JobApplicationRepository.class),
                mock(tanhs.fudn.parttime_hiring_plaform_project.repository.application.RecruitmentInteractionRepository.class),
                mock(tanhs.fudn.parttime_hiring_plaform_project.repository.job.SavedJobRepository.class), Mappers.getMapper(AdminJobPostMapper.class));
        assertEquals(1, service.getAllJobPosts(0, 10, JobStatus.CLOSED, " test ").getTotalElements());
        assertEquals("Full details", service.getDetail(1).getDescription());
        assertEquals(JobStatus.CLOSED, service.getDetail(1).getStatus());
        service.updateJobPostStatus(1, JobStatus.PAUSED);
        assertTrue(job.getModerationBlocked());
        assertEquals(JobStatus.PAUSED, job.getStatus());
        assertThrows(tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException.class,
                () -> service.updateJobPostStatus(1, JobStatus.ACTIVE));
    }
}
