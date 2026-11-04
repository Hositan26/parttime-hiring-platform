package tanhs.fudn.parttime_hiring_plaform_project.user;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
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
    // Rejects excessive page sizes and forwards bounded requests with stable ordering.
    @Test
    void boundsPagination() {
        JobPostRepository jobs = mock(JobPostRepository.class);
        JobPostServiceImpl service = new JobPostServiceImpl(jobs, mock(JobCategoryRepository.class),
                mock(WorkShiftRepository.class), mock(JobMapper.class), new JobAvailabilityPolicy());
        assertThrows(BusinessException.class, () -> service.searchJobPage(null, null, null, null,
                null, null, null, null, null, null, -1, 12));
        assertThrows(BusinessException.class, () -> service.searchJobPage(null, null, null, null,
                null, null, null, null, null, null, 0, 51));
        when(jobs.findAll(any(Specification.class), any(Pageable.class))).thenReturn(Page.empty());
        service.searchJobPage(null, null, null, null, null, null, null, null, null, null, 2, 12);
        verify(jobs).findAll(any(Specification.class), argThat((Pageable page) -> page.getPageNumber() == 2
                && page.getPageSize() == 12 && page.getSort().getOrderFor("jobPostId").isDescending()));
    }
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
