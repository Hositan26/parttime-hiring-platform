package tanhs.fudn.parttime_hiring_plaform_project.service.employer;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import tanhs.fudn.parttime_hiring_plaform_project.dto.employer.store.CreateStoreRequestDTO;
import tanhs.fudn.parttime_hiring_plaform_project.dto.employer.store.EmployerStoreDTO;
import tanhs.fudn.parttime_hiring_plaform_project.dto.employer.store.EmployerStoreDetailDTO;
import tanhs.fudn.parttime_hiring_plaform_project.dto.employer.store.EmployerStoreListDTO;
import tanhs.fudn.parttime_hiring_plaform_project.dto.employer.store.UpdateStoreRequestDTO;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Store;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.repository.application.JobApplicationRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.StoreRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service xử lý các nghiệp vụ liên quan đến Cửa hàng (Store) của Nhà tuyển dụng.
 */
@Service
@RequiredArgsConstructor
public class EmployerStoreService {

    private final EmployerRepository employerRepository;
    private final StoreRepository storeRepository;
    private final JobPostRepository jobPostRepository;
    private final JobApplicationRepository jobApplicationRepository;

    /**
     * Lấy danh sách các cửa hàng của một nhà tuyển dụng, kèm theo thống kê số lượng tin tuyển dụng và đơn ứng tuyển.
     * @param userId ID của người dùng đang đăng nhập (Employer).
     * @param sortBy Tiêu chí sắp xếp danh sách (ví dụ: "applications", "jobs", "newest").
     * @return DTO chứa danh sách cửa hàng và các số liệu tổng quan.
     */
    public EmployerStoreListDTO getEmployerStores(Integer userId, String sortBy) {
        Employer employer = employerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin nhà tuyển dụng."));
        
        List<Store> stores = storeRepository.findByEmployer_EmployerId(employer.getEmployerId());
        
        long totalStores = stores.size();
        long activeStores = stores.stream().filter(Store::getIsActive).count();
        long inactiveStores = totalStores - activeStores;
        
        List<EmployerStoreDTO> storeDTOs = stores.stream().map(store -> {
            long jobsCount = jobPostRepository.countByStore_StoreId(store.getStoreId());
            long applicationsCount = jobApplicationRepository.countByStoreId(store.getStoreId());
            
            String address = store.getStreetAddress() + ", " + store.getWard() + ", " + store.getDistrict() + ", " + store.getCity();
            
            return EmployerStoreDTO.builder()
                    .storeId(store.getStoreId())
                    .name(store.getStoreName())
                    .phone(store.getPhoneContact() != null ? store.getPhoneContact() : employer.getPhoneContact())
                    .address(address)
                    .jobs(jobsCount)
                    .applications(applicationsCount)
                    .status(store.getIsActive() ? "ACTIVE" : "INACTIVE")
                    .logo("https://cdn-icons-png.flaticon.com/512/3268/3268832.png")
                    .build();
        }).collect(Collectors.toList());
        
        if ("applications".equalsIgnoreCase(sortBy)) {
            storeDTOs.sort(Comparator.comparing(EmployerStoreDTO::getApplications).reversed());
        } else if ("jobs".equalsIgnoreCase(sortBy)) {
            storeDTOs.sort(Comparator.comparing(EmployerStoreDTO::getJobs).reversed());
        } else {
            storeDTOs.sort(Comparator.comparing(EmployerStoreDTO::getStoreId).reversed());
        }
        
        return EmployerStoreListDTO.builder()
                .totalStores(totalStores)
                .activeStores(activeStores)
                .inactiveStores(inactiveStores)
                .stores(storeDTOs)
                .build();
    }

    /**
     * Xóa một cửa hàng khỏi hệ thống.
     * Chỉ cho phép xóa nếu cửa hàng thuộc về nhà tuyển dụng này, cửa hàng đã được duyệt, và chưa có tin tuyển dụng nào.
     * @param userId ID của nhà tuyển dụng.
     * @param storeId ID của cửa hàng cần xóa.
     * @throws RuntimeException Nếu vi phạm các quy tắc nghiệp vụ khi xóa.
     */
    @Transactional
    public void deleteStore(Integer userId, Integer storeId) {
        Employer employer = employerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin nhà tuyển dụng."));
        
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

    /**
     * Cập nhật thông tin cửa hàng (Tên, số điện thoại, địa chỉ, mô tả).
     * @param userId ID của nhà tuyển dụng.
     * @param storeId ID của cửa hàng cần sửa.
     * @param request Dữ liệu cập nhật mới.
     * @throws RuntimeException Nếu cửa hàng đang chờ phê duyệt hoặc không thuộc về nhà tuyển dụng.
     */
    @Transactional
    public void updateStore(Integer userId, Integer storeId, UpdateStoreRequestDTO request) {
        Employer employer = employerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin nhà tuyển dụng."));
        
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

    /**
     * Tạo mới một cửa hàng. Cửa hàng mặc định sẽ có trạng thái chờ phê duyệt (isActive = false).
     * @param userId ID của nhà tuyển dụng.
     * @param request Dữ liệu khởi tạo cửa hàng.
     * @return DTO chứa thông tin cửa hàng vừa được tạo.
     */
    @Transactional
    public EmployerStoreDTO createStore(Integer userId, CreateStoreRequestDTO request) {
        Employer employer = employerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin nhà tuyển dụng."));
                
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
        
        String address = (store.getStreetAddress() != null ? store.getStreetAddress() : "") + ", " +
                         (store.getWard() != null ? store.getWard() : "") + ", " +
                         (store.getDistrict() != null ? store.getDistrict() : "") + ", " +
                         (store.getCity() != null ? store.getCity() : "");
        
        return EmployerStoreDTO.builder()
                .storeId(store.getStoreId())
                .name(store.getStoreName())
                .phone(store.getPhoneContact() != null ? store.getPhoneContact() : employer.getPhoneContact())
                .address(address)
                .jobs(0L)
                .applications(0L)
                .status("INACTIVE")
                .logo("https://ui-avatars.com/api/?name=" + store.getStoreName().replace(" ", "+") + "&background=random")
                .build();
    }

    /**
     * Bật/Tắt trạng thái hoạt động của một cửa hàng.
     * @param userId ID của nhà tuyển dụng.
     * @param storeId ID của cửa hàng cần thay đổi trạng thái.
     * @return DTO chứa thông tin cửa hàng sau khi thay đổi.
     */
    @Transactional
    public EmployerStoreDTO toggleStoreStatus(Integer userId, Integer storeId) {
        Employer employer = employerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin nhà tuyển dụng."));
        
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cửa hàng."));
        
        if (!store.getEmployer().getEmployerId().equals(employer.getEmployerId())) {
            throw new RuntimeException("Bạn không có quyền thay đổi trạng thái cửa hàng này.");
        }
        
        store.setIsActive(!store.getIsActive());
        store = storeRepository.save(store);
        
        long jobCount = jobPostRepository.countByStore_StoreId(storeId);
        long applicationCount = jobApplicationRepository.countByStoreId(storeId);
        
        String address = String.format("%s, %s, %s, %s", 
                store.getStreetAddress() != null ? store.getStreetAddress() : "",
                store.getWard() != null ? store.getWard() : "",
                store.getDistrict() != null ? store.getDistrict() : "",
                store.getCity() != null ? store.getCity() : "").replaceAll("^, |, $|(,\\s*,)+", ", ");

        return EmployerStoreDTO.builder()
                .storeId(store.getStoreId())
                .name(store.getStoreName())
                .phone(store.getPhoneContact() != null ? store.getPhoneContact() : employer.getPhoneContact())
                .address(address)
                .jobs(jobCount)
                .applications(applicationCount)
                .status(store.getIsActive() ? "ACTIVE" : "PAUSED")
                .logo("https://ui-avatars.com/api/?name=" + store.getStoreName().replace(" ", "+") + "&background=random")
                .build();
    }

    /**
     * Lấy thông tin chi tiết của cửa hàng, bao gồm danh sách các tin tuyển dụng liên kết với cửa hàng đó.
     * @param userId ID của nhà tuyển dụng.
     * @param storeId ID của cửa hàng.
     * @return DTO chứa thông tin chi tiết cửa hàng.
     */
    public EmployerStoreDetailDTO getStoreDetail(Integer userId, Integer storeId) {
        Employer employer = employerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin nhà tuyển dụng."));
        
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cửa hàng."));
        
        if (!store.getEmployer().getEmployerId().equals(employer.getEmployerId())) {
            throw new RuntimeException("Bạn không có quyền xem cửa hàng này.");
        }
        
        List<JobPost> jobs = jobPostRepository.findByStore_StoreId(storeId);
        
        List<EmployerStoreDetailDTO.StoreJobDTO> jobDTOs = jobs.stream().map(job -> {
            long appCount = jobApplicationRepository.countByJobPost_JobPostId(job.getJobPostId());
            return EmployerStoreDetailDTO.StoreJobDTO.builder()
                    .jobId(job.getJobPostId())
                    .title(job.getTitle())
                    .status(job.getStatus())
                    .applications(appCount)
                    .expiredAt(job.getExpiredAt())
                    .createdAt(job.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
        
        String address = store.getStreetAddress() + ", " + store.getWard() + ", " + store.getDistrict() + ", " + store.getCity();
        
        return EmployerStoreDetailDTO.builder()
                .storeId(store.getStoreId())
                .name(store.getStoreName())
                .phone(store.getPhoneContact() != null ? store.getPhoneContact() : employer.getPhoneContact())
                .address(address)
                .description(store.getDescription())
                .status(store.getIsActive() ? "ACTIVE" : "INACTIVE")
                .logo("https://cdn-icons-png.flaticon.com/512/3268/3268832.png")
                .jobs(jobDTOs)
                .build();
    }
}
