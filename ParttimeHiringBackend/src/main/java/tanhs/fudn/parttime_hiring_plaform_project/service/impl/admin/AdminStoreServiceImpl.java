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
    private final tanhs.fudn.parttime_hiring_plaform_project.mapper.AdminStoreMapper mapper;

    // Lists stores with independent approval and operational states.
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

        return stores.map(mapper::toResponse);
    }

    // Changes approval without enabling or disabling employer-controlled activity.
    @Override
    @Transactional
    public AdminStoreResponse updateStoreApproval(Integer storeId, Boolean approved) {
        Store store = storeRepository.lockById(storeId)
                .orElseThrow(() -> new tanhs.fudn.parttime_hiring_plaform_project.exception.ResourceNotFoundException("Store not found"));
        if (approved == null) throw new IllegalArgumentException("Approval is required");
        store.setIsApproved(approved);
        return mapper.toResponse(storeRepository.save(store));
    }

    // Updates activity only after the store has passed administrative approval.
    @Override
    @Transactional
    public AdminStoreResponse updateStoreStatus(Integer storeId, Boolean isActive) {
        Store store = storeRepository.lockById(storeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cửa hàng/chi nhánh"));
        
        if (isActive == null) throw new IllegalArgumentException("Activity is required");
        if (isActive && !Boolean.TRUE.equals(store.getIsApproved())) {
            throw new tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException("Approve the store before activating it");
        }
        store.setIsActive(isActive);
        return mapper.toResponse(storeRepository.save(store));
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
