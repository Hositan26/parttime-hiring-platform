package tanhs.fudn.parttime_hiring_plaform_project.employer;

import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer.job.CreateEmployerJobRequest;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Store;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmployerStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.EmployerJobMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.application.JobApplicationRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.StoreRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobCategoryRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.WorkShiftRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.review.StoreReviewRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.impl.employer.EmployerJobServiceImpl;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmployerJobPublicationTest {
    private final UserRepository users = mock(UserRepository.class);
    private final EmployerRepository employers = mock(EmployerRepository.class);
    private final StoreRepository stores = mock(StoreRepository.class);
    private final JobPostRepository jobs = mock(JobPostRepository.class);
    private final EmployerJobMapper mapper = mock(EmployerJobMapper.class);
    private final EmployerJobServiceImpl service = new EmployerJobServiceImpl(users, employers, jobs, stores,
            mock(StoreReviewRepository.class), mock(JobApplicationRepository.class),
            mock(JobCategoryRepository.class), mock(WorkShiftRepository.class), mapper);

    // Prevents pending, paused, and inactive businesses from publishing jobs.
    @Test
    void rejectsUnavailableStoresAndEmployers() {
        Employer employer = Employer.builder().employerId(7).status(EmployerStatus.ACTIVE).build();
        Store store = Store.builder().employer(employer).isActive(true).isApproved(false).build();
        CreateEmployerJobRequest request = prepare(employer, store);

        assertThrows(BusinessException.class, () -> service.createEmployerJob("employer", request));
        store.setIsApproved(true);
        store.setIsActive(false);
        assertThrows(BusinessException.class, () -> service.createEmployerJob("employer", request));
        store.setIsActive(true);
        employer.setStatus(null);
        assertThrows(BusinessException.class, () -> service.createEmployerJob("employer", request));
        verifyNoInteractions(jobs, mapper);
    }

    // Publishes a job when the owned store is approved and active.
    @Test
    void publishesFromApprovedStore() {
        Employer employer = Employer.builder().employerId(7).status(EmployerStatus.ACTIVE).build();
        Store store = Store.builder().employer(employer).isActive(true).isApproved(true).build();
        CreateEmployerJobRequest request = prepare(employer, store);
        JobPost post = JobPost.builder().build();
        when(mapper.toEntity(request)).thenReturn(post);
        when(jobs.save(post)).thenReturn(post);

        service.createEmployerJob("employer", request);

        assertSame(store, post.getStore());
        assertEquals(JobStatus.ACTIVE, post.getStatus());
        verify(jobs).save(post);
    }

    // Sets up the authenticated employer and the locked store.
    private CreateEmployerJobRequest prepare(Employer employer, Store store) {
        when(users.findByUsername("employer")).thenReturn(Optional.of(User.builder().id(1L).build()));
        when(employers.findByUserId(1)).thenReturn(Optional.of(employer));
        when(stores.lockById(3)).thenReturn(Optional.of(store));
        CreateEmployerJobRequest request = new CreateEmployerJobRequest();
        request.setStoreId(3);
        request.setExpiredAt(LocalDate.now().plusDays(1));
        return request;
    }
}
