package tanhs.fudn.parttime_hiring_plaform_project.employer;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import static org.junit.jupiter.api.Assertions.*;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer.store.CreateStoreRequest;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Store;
import tanhs.fudn.parttime_hiring_plaform_project.service.employer.EmployerStoreService;

class EmployerStoreCreationIntegrationTest extends EmployerIntegrationFixture {
    @Autowired EmployerStoreService stores;
    // Persists location and contact fields while requiring initial approval.
    @Test
    void verifiesWorkflow() throws Exception {
        var owner = business();
        var request = CreateStoreRequest.builder().name("New store").phone("0901234567").city("Da Nang")
                .district("Hai Chau").ward("Hoa Cuong").streetAddress("12 Main").build();
        var result = stores.createStore(owner.username(), request);
        database.flush();
        var store = database.find(Store.class, result.getStoreId());
        assertEquals("PENDING", result.getStatus());
        assertFalse(store.getIsApproved());
        assertFalse(store.getIsActive());
        assertEquals(owner.employer().getEmployerId(), store.getEmployer().getEmployerId());
        assertEquals("Da Nang", store.getCity());
        assertEquals("Hai Chau", store.getDistrict());
        assertEquals("Hoa Cuong", store.getWard());
        assertEquals("12 Main", store.getStreetAddress());
        assertEquals("0901234567", store.getPhoneContact());
    }
}
