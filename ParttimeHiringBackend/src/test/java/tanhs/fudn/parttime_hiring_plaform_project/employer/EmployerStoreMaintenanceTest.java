package tanhs.fudn.parttime_hiring_plaform_project.employer;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer.store.UpdateStoreRequest;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Store;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.StoreMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.application.JobApplicationRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.StoreRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employment.EmploymentRecordRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.impl.employer.EmployerStoreServiceImpl;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmployerStoreMaintenanceTest {
    // Keeps approval for ordinary edits and requires review when the street changes.
    @Test
    void reviewsAddressChangesAndProtectsEmploymentHistory() {
        var users = mock(UserRepository.class);
        var employers = mock(EmployerRepository.class);
        var stores = mock(StoreRepository.class);
        var employment = mock(EmploymentRecordRepository.class);
        var service = new EmployerStoreServiceImpl(users, employers, stores, mock(JobPostRepository.class),
                mock(JobApplicationRepository.class), mock(StoreMapper.class), employment);
        Employer owner = Employer.builder().employerId(7).build();
        Store store = Store.builder().employer(owner).streetAddress("12 Main").isActive(true).isApproved(true).build();
        when(users.findByUsername("owner")).thenReturn(Optional.of(User.builder().id(1L).build()));
        when(employers.findByUserId(1)).thenReturn(Optional.of(owner));
        when(stores.lockById(2)).thenReturn(Optional.of(store));

        UpdateStoreRequest request = new UpdateStoreRequest();
        request.setName("New name");
        request.setAddress("12 Main");
        service.updateStore("owner", 2, request);
        assertTrue(store.getIsApproved());
        assertTrue(store.getIsActive());

        request.setAddress("14 Main");
        service.updateStore("owner", 2, request);
        assertFalse(store.getIsApproved());
        assertFalse(store.getIsActive());

        when(employment.existsByStore_StoreId(2)).thenReturn(true);
        assertThrows(BusinessException.class, () -> service.deleteStore("owner", 2));
        verify(stores, never()).delete(store);
        when(employment.existsByStore_StoreId(2)).thenReturn(false);
        service.deleteStore("owner", 2);
        verify(stores).delete(store);
    }
}
