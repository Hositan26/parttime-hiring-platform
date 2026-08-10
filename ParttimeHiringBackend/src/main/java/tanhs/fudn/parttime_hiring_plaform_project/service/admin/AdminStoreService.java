package tanhs.fudn.parttime_hiring_plaform_project.service.admin;

import org.springframework.data.domain.Page;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.store.AdminStoreResponse;

public interface AdminStoreService {
    Page<AdminStoreResponse> getAllStores(int page, int size, Boolean isActive);
    AdminStoreResponse updateStoreStatus(Integer storeId, Boolean isActive);
    void deleteStore(Integer storeId);
}
