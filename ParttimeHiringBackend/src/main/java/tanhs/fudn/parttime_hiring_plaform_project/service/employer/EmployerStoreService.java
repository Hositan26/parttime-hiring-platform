package tanhs.fudn.parttime_hiring_plaform_project.service.employer;

import tanhs.fudn.parttime_hiring_plaform_project.service.employer.EmployerStoreService;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer.store.CreateStoreRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.store.EmployerStoreResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.store.EmployerStoreDetailResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.store.EmployerStoreListResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer.store.UpdateStoreRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.store.EmployeeResponse;
import java.util.List;

public interface EmployerStoreService {
    EmployerStoreListResponse getEmployerStores(String username, String sortBy);
    // Uploads or replaces the cover image of an owned store.
    String uploadCover(String username, Integer storeId, org.springframework.web.multipart.MultipartFile file) throws java.io.IOException;
    // Removes the cover from an owned store.
    void removeCover(String username, Integer storeId);

    void deleteStore(String username, Integer storeId);
    void updateStore(String username, Integer storeId, UpdateStoreRequest request);
    EmployerStoreResponse createStore(String username, CreateStoreRequest request);
    EmployerStoreResponse toggleStoreStatus(String username, Integer storeId);
    EmployerStoreDetailResponse getStoreDetail(String username, Integer storeId);
    List<EmployeeResponse> getStoreEmployees(String username, Integer storeId);
}