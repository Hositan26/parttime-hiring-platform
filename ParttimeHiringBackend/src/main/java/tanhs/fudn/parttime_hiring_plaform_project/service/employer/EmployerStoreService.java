package tanhs.fudn.parttime_hiring_plaform_project.service.employer;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tanhs.fudn.parttime_hiring_plaform_project.dto.employer.store.EmployerStoreDTO;
import tanhs.fudn.parttime_hiring_plaform_project.dto.employer.store.EmployerStoreListDTO;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Store;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.StoreRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.application.JobApplicationRepository;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployerStoreService {

    private final EmployerRepository employerRepository;
    private final StoreRepository storeRepository;
    private final JobPostRepository jobPostRepository;
    private final JobApplicationRepository jobApplicationRepository;

    public EmployerStoreListDTO getEmployerStores(Integer userId, String sortBy) {
        Employer employer = employerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Employer not found"));
        
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
        
        // Sorting
        if ("applications".equalsIgnoreCase(sortBy)) {
            storeDTOs.sort(Comparator.comparing(EmployerStoreDTO::getApplications).reversed());
        } else if ("jobs".equalsIgnoreCase(sortBy)) {
            storeDTOs.sort(Comparator.comparing(EmployerStoreDTO::getJobs).reversed());
        } else {
            // Default "newest", assuming storeId descending
            storeDTOs.sort(Comparator.comparing(EmployerStoreDTO::getStoreId).reversed());
        }
        
        return EmployerStoreListDTO.builder()
                .totalStores(totalStores)
                .activeStores(activeStores)
                .inactiveStores(inactiveStores)
                .stores(storeDTOs)
                .build();
    }
}
