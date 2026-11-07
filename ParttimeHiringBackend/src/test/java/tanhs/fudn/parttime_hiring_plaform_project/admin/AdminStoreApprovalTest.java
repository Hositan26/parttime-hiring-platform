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
        var service = new AdminStoreServiceImpl(stores, Mappers.getMapper(AdminStoreMapper.class));
        assertThrows(BusinessException.class, () -> service.updateStoreStatus(1, true));
        service.updateStoreApproval(1, true);
        assertFalse(store.getIsActive());
        service.updateStoreStatus(1, true);
        assertTrue(store.getIsActive());
        service.updateStoreApproval(1, false);
        assertTrue(store.getIsActive());
        assertFalse(store.getIsApproved());
    }
}
