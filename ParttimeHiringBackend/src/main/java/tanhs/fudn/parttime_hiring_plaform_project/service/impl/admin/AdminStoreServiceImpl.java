package tanhs.fudn.parttime_hiring_plaform_project.service.impl.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.store.AdminStoreResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Store;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.StoreRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminStoreService;

@Service
@RequiredArgsConstructor
public class AdminStoreServiceImpl implements AdminStoreService {

    private final StoreRepository storeRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<AdminStoreResponse> getAllStores(int page, int size, Boolean isActive) {
        Page<Store> stores;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("storeId").descending());
        
        if (isActive != null) {
            stores = storeRepository.findByIsActive(isActive, pageRequest);
        } else {
            stores = storeRepository.findAll(pageRequest);
        }

        return stores.map(store -> {
            String address = "";
            if (store.getStreetAddress() != null) address += store.getStreetAddress() + ", ";
            if (store.getWard() != null) address += store.getWard() + ", ";
            if (store.getDistrict() != null) address += store.getDistrict() + ", ";
            if (store.getCity() != null) address += store.getCity();
            if (address.endsWith(", ")) address = address.substring(0, address.length() - 2);

            return AdminStoreResponse.builder()
                .storeId(store.getStoreId())
                .storeName(store.getStoreName())
                .phoneContact(store.getPhoneContact())
                .address(address)
                .isActive(store.getIsActive())
                .createdAt(store.getCreatedAt())
                .employerId(store.getEmployer().getEmployerId())
                .companyName(store.getEmployer().getCompanyName())
                .build();
        });
    }

    @Override
    @Transactional
    public AdminStoreResponse updateStoreStatus(Integer storeId, Boolean isActive) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cửa hàng/chi nhánh"));
        
        store.setIsActive(isActive);
        storeRepository.save(store);

        String address = "";
        if (store.getStreetAddress() != null) address += store.getStreetAddress() + ", ";
        if (store.getWard() != null) address += store.getWard() + ", ";
        if (store.getDistrict() != null) address += store.getDistrict() + ", ";
        if (store.getCity() != null) address += store.getCity();
        if (address.endsWith(", ")) address = address.substring(0, address.length() - 2);

        return AdminStoreResponse.builder()
                .storeId(store.getStoreId())
                .storeName(store.getStoreName())
                .phoneContact(store.getPhoneContact())
                .address(address)
                .isActive(store.getIsActive())
                .createdAt(store.getCreatedAt())
                .employerId(store.getEmployer().getEmployerId())
                .companyName(store.getEmployer().getCompanyName())
                .build();
    }

    @Override
    @Transactional
    public void deleteStore(Integer storeId) {
        if (!storeRepository.existsById(storeId)) {
            throw new RuntimeException("Không tìm thấy cửa hàng/chi nhánh");
        }
        storeRepository.deleteById(storeId);
    }
}
