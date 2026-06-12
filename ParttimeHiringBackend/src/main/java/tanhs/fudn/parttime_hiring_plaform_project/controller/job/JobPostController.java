package tanhs.fudn.parttime_hiring_plaform_project.controller.job;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import tanhs.fudn.parttime_hiring_plaform_project.dto.job.JobPostDTO;
import tanhs.fudn.parttime_hiring_plaform_project.dto.job.JobPostDetailDTO;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.repository.JobPostRepository;

import java.text.DecimalFormat;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobs")
public class JobPostController {

    private final JobPostRepository jobPostRepository;
    private final tanhs.fudn.parttime_hiring_plaform_project.repository.JobCategoryRepository categoryRepository;
    private final tanhs.fudn.parttime_hiring_plaform_project.repository.WorkShiftRepository shiftRepository;

    public JobPostController(JobPostRepository jobPostRepository,
                             tanhs.fudn.parttime_hiring_plaform_project.repository.JobCategoryRepository categoryRepository,
                             tanhs.fudn.parttime_hiring_plaform_project.repository.WorkShiftRepository shiftRepository) {
        this.jobPostRepository = jobPostRepository;
        this.categoryRepository = categoryRepository;
        this.shiftRepository = shiftRepository;
    }

    @GetMapping("/categories")
    public ResponseEntity<?> getCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @GetMapping("/shifts")
    public ResponseEntity<?> getShifts() {
        return ResponseEntity.ok(shiftRepository.findAll());
    }

    @GetMapping("/search")
    public ResponseEntity<List<JobPostDTO>> searchJobs(
            @org.springframework.web.bind.annotation.RequestParam(required = false) String title,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String storeName,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Integer categoryId,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Integer shiftId,
            @org.springframework.web.bind.annotation.RequestParam(required = false) java.math.BigDecimal minWage,
            @org.springframework.web.bind.annotation.RequestParam(required = false) java.math.BigDecimal maxWage,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String city,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String district,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String ward,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String streetAddress
    ) {
        org.springframework.data.jpa.domain.Specification<JobPost> spec = 
            tanhs.fudn.parttime_hiring_plaform_project.repository.JobPostSpecification.filterJobs(
                title, storeName, categoryId, shiftId, minWage, maxWage, city, district, ward, streetAddress
            );

        List<JobPost> jobPosts = jobPostRepository.findAll(spec);
        DecimalFormat df = new DecimalFormat("#,###");

        List<JobPostDTO> dtos = jobPosts.stream().map(job -> {
            String salaryStr = "";
            if (job.getHourlyWageMax() != null) {
                salaryStr = df.format(job.getHourlyWageMin()) + "đ - " + df.format(job.getHourlyWageMax()) + "đ/giờ";
            } else {
                salaryStr = df.format(job.getHourlyWageMin()) + "đ/giờ";
            }

            String storeStr = job.getStore().getStoreName();
            if (job.getStore().getDistrict() != null) {
                storeStr += " • " + job.getStore().getDistrict();
            }

            String address = job.getStore().getStreetAddress() != null ? job.getStore().getStreetAddress() : "";
            if (job.getStore().getWard() != null) address += ", " + job.getStore().getWard();
            if (job.getStore().getDistrict() != null) address += ", " + job.getStore().getDistrict();
            if (job.getStore().getCity() != null) address += ", " + job.getStore().getCity();
            if (address.startsWith(", ")) address = address.substring(2);

            List<String> shiftList = job.getShifts().stream()
                    .map(shift -> shift.getShiftName())
                    .collect(Collectors.toList());

            String dateStr = job.getPublishedAt() != null 
                    ? job.getPublishedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) 
                    : (job.getCreatedAt() != null ? job.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "");

            return JobPostDTO.builder()
                    .id(job.getJobPostId())
                    .title(job.getTitle())
                    .store(storeStr)
                    .location(address)
                    .salary(salaryStr)
                    .shifts(shiftList)
                    .headcount(job.getVacancyCount())
                    .date(dateStr)
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping
    public ResponseEntity<List<JobPostDTO>> getAllJobs() {
        List<JobPost> jobPosts = jobPostRepository.findAll();
        DecimalFormat df = new DecimalFormat("#,###");

        List<JobPostDTO> dtos = jobPosts.stream().map(job -> {
            // Định dạng chuỗi lương
            String salaryStr = "";
            if (job.getHourlyWageMax() != null) {
                salaryStr = df.format(job.getHourlyWageMin()) + "đ - " + df.format(job.getHourlyWageMax()) + "đ/giờ";
            } else {
                salaryStr = df.format(job.getHourlyWageMin()) + "đ/giờ";
            }

            // Xây dựng chuỗi cửa hàng
            String storeStr = job.getStore().getStoreName();
            if (job.getStore().getDistrict() != null) {
                storeStr += " • " + job.getStore().getDistrict();
            }

            // Xây dựng địa chỉ
            String address = job.getStore().getStreetAddress() != null ? job.getStore().getStreetAddress() : "";
            if (job.getStore().getWard() != null) address += ", " + job.getStore().getWard();
            if (job.getStore().getDistrict() != null) address += ", " + job.getStore().getDistrict();
            if (job.getStore().getCity() != null) address += ", " + job.getStore().getCity();
            if (address.startsWith(", ")) address = address.substring(2);

            // Xây dựng danh sách ca làm
            List<String> shiftList = job.getShifts().stream()
                    .map(shift -> shift.getShiftName())
                    .collect(Collectors.toList());

            // Xây dựng ngày tháng
            String dateStr = job.getPublishedAt() != null 
                    ? job.getPublishedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) 
                    : (job.getCreatedAt() != null ? job.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "");

            return JobPostDTO.builder()
                    .id(job.getJobPostId())
                    .title(job.getTitle())
                    .store(storeStr)
                    .location(address)
                    .salary(salaryStr)
                    .shifts(shiftList)
                    .headcount(job.getVacancyCount())
                    .date(dateStr)
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<JobPostDetailDTO> getJobById(@PathVariable Integer id) {
        JobPost job = jobPostRepository.findById(id).orElse(null);
        if (job == null) {
            return ResponseEntity.notFound().build();
        }

        String storeStr = job.getStore() != null ? job.getStore().getStoreName() : "Unknown Store";
        String companyStr = job.getStore() != null && job.getStore().getEmployer() != null ? job.getStore().getEmployer().getCompanyName() : "Unknown Company";
        String phoneStr = job.getStore() != null && job.getStore().getEmployer() != null ? job.getStore().getEmployer().getPhoneContact() : "";
        if (phoneStr == null) phoneStr = "0914 768 239"; // Mock phone
        
        String address = "";
        String fullAddress = "";
        if (job.getStore() != null) {
            address = job.getStore().getCity();
            fullAddress = job.getStore().getStreetAddress() + ", " + job.getStore().getWard() + ", " + job.getStore().getDistrict() + ", " + job.getStore().getCity();
        }

        String salaryStr = String.format("%,d - %,d %s", job.getHourlyWageMin().intValue(), job.getHourlyWageMax().intValue(), job.getCurrency());
        String dateStr = job.getPublishedAt() != null ? job.getPublishedAt().toLocalDate().toString() : "";
        String expiredStr = job.getExpiredAt() != null ? job.getExpiredAt().toLocalDate().toString() : "";

        List<String> shiftList = job.getShifts() != null 
                ? job.getShifts().stream().map(s -> s.getShiftName()).collect(Collectors.toList()) 
                : List.of();
                
        List<String> categoryList = job.getCategories() != null 
                ? job.getCategories().stream().map(c -> c.getCategoryName()).collect(Collectors.toList()) 
                : List.of();
                
        List<String> imageList = job.getImages() != null 
                ? job.getImages().stream().map(i -> i.getImageUrl()).collect(Collectors.toList()) 
                : List.of();

        String ageRange = (job.getMinAge() != null ? job.getMinAge() : "18") + " - " + (job.getMaxAge() != null ? job.getMaxAge() : "25") + " tuổi";

        JobPostDetailDTO detail = JobPostDetailDTO.builder()
                .id(job.getJobPostId())
                .title(job.getTitle())
                .company(companyStr)
                .storeName(storeStr)
                .address(address)
                .fullAddress(fullAddress)
                .wage(salaryStr)
                .headcount(job.getVacancyCount())
                .gender(job.getGenderRequirement() != null ? job.getGenderRequirement() : "ANY")
                .ageRange(ageRange)
                .postedDate(dateStr)
                .expiredDate(expiredStr)
                .description(job.getJobDescription())
                .requirements(job.getRequirements())
                .benefits(job.getBenefits())
                .phoneContact(phoneStr)
                .categories(categoryList)
                .images(imageList)
                .shifts(shiftList)
                .build();

        return ResponseEntity.ok(detail);
    }
}
