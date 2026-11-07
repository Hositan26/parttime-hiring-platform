package tanhs.fudn.parttime_hiring_plaform_project.admin;

import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import java.util.Optional;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.StoreRepository;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Store;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.AdminStoreMapper;
import tanhs.fudn.parttime_hiring_plaform_project.service.impl.admin.AdminStoreServiceImpl;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class AdminStoreApprovalTest {
    // Keeps approval independent from activity throughout review and suspension.
    @Test
    void approvalDoesNotActivateAndActivityCannotGrantApproval() {
        var stores = mock(StoreRepository.class);
        var store = Store.builder().storeId(1).isApproved(false).isActive(false).build();
        when(stores.lockById(1)).thenReturn(Optional.of(store));
        when(stores.save(store)).thenReturn(store);
        var jobs = mock(tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository.class);
        var employment = mock(tanhs.fudn.parttime_hiring_plaform_project.repository.employment.EmploymentRecordRepository.class);
        var service = new AdminStoreServiceImpl(stores, jobs, employment, Mappers.getMapper(AdminStoreMapper.class));
        assertThrows(BusinessException.class, () -> service.updateStoreStatus(1, true));
        service.updateStoreApproval(1, true);
        assertFalse(store.getIsActive());
        service.updateStoreStatus(1, true);
        assertTrue(store.getIsActive());
        service.updateStoreApproval(1, false);
        assertTrue(store.getIsActive());
        assertFalse(store.getIsApproved());
        when(jobs.countByStore_StoreId(1)).thenReturn(2L);
        assertThrows(BusinessException.class, () -> service.deleteStore(1));
        verify(stores, never()).delete(store);
    }
}
