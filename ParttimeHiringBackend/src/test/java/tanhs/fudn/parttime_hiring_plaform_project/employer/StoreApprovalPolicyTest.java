package tanhs.fudn.parttime_hiring_plaform_project.employer;

import org.junit.jupiter.api.Test;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Store;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.service.employer.StoreApprovalPolicy;
import static org.junit.jupiter.api.Assertions.*;

class StoreApprovalPolicyTest {
    // Prevents activation of pending and previously inactive legacy stores.
    @Test
    void rejectsPendingStores() {
        Store store = Store.builder().isActive(false).build();
        assertEquals("PENDING", StoreApprovalPolicy.status(store));
        assertThrows(BusinessException.class, () -> StoreApprovalPolicy.toggleActivity(store));
        assertFalse(store.getIsActive());
    }

    // Retains approval when an active legacy store is paused and resumed.
    @Test
    void preservesLegacyApproval() {
        Store store = Store.builder().isActive(true).isApproved(true).build();
        StoreApprovalPolicy.toggleActivity(store);
        assertEquals("PAUSED", StoreApprovalPolicy.status(store));
        assertTrue(store.getIsApproved());
        StoreApprovalPolicy.toggleActivity(store);
        assertEquals("ACTIVE", StoreApprovalPolicy.status(store));
    }

    // Enforces explicit administrator revocation even for inconsistent legacy data.
    @Test
    void rejectsRevokedStores() {
        Store store = Store.builder().isApproved(false).isActive(true).build();
        assertThrows(BusinessException.class, () -> StoreApprovalPolicy.toggleActivity(store));
    }
}
