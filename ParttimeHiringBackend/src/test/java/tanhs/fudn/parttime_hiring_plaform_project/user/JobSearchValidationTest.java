package tanhs.fudn.parttime_hiring_plaform_project.user;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.JobMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobCategoryRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.WorkShiftRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.impl.job.JobPostServiceImpl;
import tanhs.fudn.parttime_hiring_plaform_project.service.job.JobAvailabilityPolicy;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class JobSearchValidationTest {
    // Rejects negative wages, reversed ranges, and invalid identifiers before querying.
    @Test
    void rejectsInvalidFilters() {
        JobPostRepository jobs = mock(JobPostRepository.class);
        JobPostServiceImpl service = new JobPostServiceImpl(jobs, mock(JobCategoryRepository.class),
                mock(WorkShiftRepository.class), mock(JobMapper.class), new JobAvailabilityPolicy());
        assertThrows(BusinessException.class, () -> service.searchJobs(null, null, null, null,
                BigDecimal.valueOf(-1), null, null, null, null, null));
        assertThrows(BusinessException.class, () -> service.searchJobs(null, null, null, null,
                BigDecimal.TEN, BigDecimal.ONE, null, null, null, null));
        assertThrows(BusinessException.class, () -> service.searchJobs(null, null, 0, null,
                null, null, null, null, null, null));
        verifyNoInteractions(jobs);
    }
}
