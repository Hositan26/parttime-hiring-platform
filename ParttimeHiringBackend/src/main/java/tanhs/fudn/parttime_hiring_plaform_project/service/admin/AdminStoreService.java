package tanhs.fudn.parttime_hiring_plaform_project.service.admin;

import org.springframework.data.domain.Page;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.store.AdminStoreResponse;

public interface AdminStoreService {
    // Searches stores with separate approval and activity filters.
    Page<AdminStoreResponse> getAllStores(int page, int size, Boolean isActive, String query, Boolean approved);
    // Preserves the existing activity-only listing contract.
    default Page<AdminStoreResponse> getAllStores(int page, int size, Boolean isActive) {
        return getAllStores(page, size, isActive, "", null);
    }
    // Changes approval independently from employer-controlled activity.
    AdminStoreResponse updateStoreApproval(Integer storeId, Boolean approved);
    AdminStoreResponse updateStoreStatus(Integer storeId, Boolean isActive);
    void deleteStore(Integer storeId);
}
