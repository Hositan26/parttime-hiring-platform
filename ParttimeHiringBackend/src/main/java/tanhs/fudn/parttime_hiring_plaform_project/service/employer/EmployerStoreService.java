package tanhs.fudn.parttime_hiring_plaform_project.service.employer;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import tanhs.fudn.parttime_hiring_plaform_project.dto.employer.store.CreateStoreRequestDTO;
import tanhs.fudn.parttime_hiring_plaform_project.dto.employer.store.EmployerStoreResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.employer.store.EmployerStoreDetailResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.employer.store.EmployerStoreListResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.employer.store.UpdateStoreRequestDTO;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Store;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.StoreMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.application.JobApplicationRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.StoreRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmployerStoreService {

    UserRepository userRepository;
    EmployerRepository employerRepository;
    StoreRepository storeRepository;
    JobPostRepository jobPostRepository;
    JobApplicationRepository jobApplicationRepository;
    StoreMapper storeMapper;

    private Employer getEmployerByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng."));
        return employerRepository.findByUserId(user.getId().intValue())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin nhà tuyển dụng."));
    }

    @Transactional(readOnly = true)
    public EmployerStoreListResponse getEmployerStores(String username, String sortBy) {
        log.info("Lấy danh sách cửa hàng cho username: {}, sortBy: {}", username, sortBy);
        Employer employer = getEmployerByUsername(username);
        
        List<Store> stores = storeRepository.findByEmployer_EmployerId(employer.getEmployerId());
        
        long totalStores = stores.size();
        long activeStores = stores.stream().filter(Store::getIsActive).count();
        long inactiveStores = totalStores - activeStores;
        
        List<EmployerStoreResponse> storeDTOs = stores.stream().map(store -> {
            long jobsCount = jobPostRepository.countByStore_StoreId(store.getStoreId());
            long applicationsCount = jobApplicationRepository.countByStoreId(store.getStoreId());
            return storeMapper.toEmployerStoreResponse(store, jobsCount, applicationsCount, employer.getPhoneContact());
        }).collect(Collectors.toList());
        
        if ("applications".equalsIgnoreCase(sortBy)) {
            storeDTOs.sort(Comparator.comparing(EmployerStoreResponse::getApplications).reversed());
        } else if ("jobs".equalsIgnoreCase(sortBy)) {
            storeDTOs.sort(Comparator.comparing(EmployerStoreResponse::getJobs).reversed());
        } else {
            storeDTOs.sort(Comparator.comparing(EmployerStoreResponse::getStoreId).reversed());
        }
        
        return EmployerStoreListResponse.builder()
                .totalStores(totalStores)
                .activeStores(activeStores)
                .inactiveStores(inactiveStores)
                .stores(storeDTOs)
                .build();
    }

    @Transactional
    public void deleteStore(String username, Integer storeId) {
        log.info("Xóa cửa hàng ID: {} bởi username: {}", storeId, username);
        Employer employer = getEmployerByUsername(username);
        
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cửa hàng."));
        
        if (!store.getEmployer().getEmployerId().equals(employer.getEmployerId())) {
            throw new RuntimeException("Bạn không có quyền xóa cửa hàng này.");
        }
        
        if (!store.getIsActive()) {
            throw new RuntimeException("Cửa hàng đang chờ phê duyệt không thể bị xóa.");
        }
        
        long jobsCount = jobPostRepository.countByStore_StoreId(storeId);
        if (jobsCount > 0) {
            throw new RuntimeException("Không thể xóa cửa hàng đang có tin tuyển dụng.");
        }
        
        storeRepository.delete(store);
    }

    @Transactional
    public void updateStore(String username, Integer storeId, UpdateStoreRequestDTO request) {
        log.info("Cập nhật cửa hàng ID: {} bởi username: {}", storeId, username);
        Employer employer = getEmployerByUsername(username);
        
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cửa hàng."));
        
        if (!store.getEmployer().getEmployerId().equals(employer.getEmployerId())) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa cửa hàng này.");
        }
        
        if (!store.getIsActive()) {
            throw new RuntimeException("Cửa hàng đang chờ phê duyệt không thể chỉnh sửa.");
        }
        
        store.setStoreName(request.getName());
        store.setPhoneContact(request.getPhone());
        store.setStreetAddress(request.getAddress());
        store.setDescription(request.getDescription());
        
        storeRepository.save(store);
    }

    @Transactional
    public EmployerStoreResponse createStore(String username, CreateStoreRequestDTO request) {
        log.info("Tạo cửa hàng mới bởi username: {}", username);
        Employer employer = getEmployerByUsername(username);
                
        Store store = Store.builder()
                .employer(employer)
                .storeName(request.getName())
                .phoneContact(request.getPhone())
                .city(request.getCity() != null ? request.getCity() : "")
                .district(request.getDistrict())
                .ward(request.getWard())
                .streetAddress(request.getStreetAddress())
                .description(request.getDescription())
                .isActive(false) 
                .build();
                
        store = storeRepository.save(store);
        
        return storeMapper.toNewEmployerStoreResponse(store, employer.getPhoneContact());
    }

    @Transactional
    public EmployerStoreResponse toggleStoreStatus(String username, Integer storeId) {
        log.info("Thay đổi trạng thái cửa hàng ID: {} bởi username: {}", storeId, username);
        Employer employer = getEmployerByUsername(username);
        
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cửa hàng."));
        
        if (!store.getEmployer().getEmployerId().equals(employer.getEmployerId())) {
            throw new RuntimeException("Bạn không có quyền thay đổi trạng thái cửa hàng này.");
        }
        
        store.setIsActive(!store.getIsActive());
        store = storeRepository.save(store);
        
        long jobCount = jobPostRepository.countByStore_StoreId(storeId);
        long applicationCount = jobApplicationRepository.countByStoreId(storeId);
        
        return storeMapper.toToggledEmployerStoreResponse(store, jobCount, applicationCount, employer.getPhoneContact());
    }

    @Transactional(readOnly = true)
    public EmployerStoreDetailResponse getStoreDetail(String username, Integer storeId) {
        log.info("Lấy chi tiết cửa hàng ID: {} bởi username: {}", storeId, username);
        Employer employer = getEmployerByUsername(username);
        
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cửa hàng."));
        
        if (!store.getEmployer().getEmployerId().equals(employer.getEmployerId())) {
            throw new RuntimeException("Bạn không có quyền xem cửa hàng này.");
        }
        
        List<JobPost> jobs = jobPostRepository.findByStore_StoreId(storeId);
        
        List<EmployerStoreDetailResponse.StoreJobDTO> jobDTOs = jobs.stream().map(job -> {
            long appCount = jobApplicationRepository.countByJobPost_JobPostId(job.getJobPostId());
            return storeMapper.toStoreJobDTO(job, appCount);
        }).collect(Collectors.toList());
        
        return storeMapper.toEmployerStoreDetailResponse(store, employer.getPhoneContact(), jobDTOs);
    }
}
