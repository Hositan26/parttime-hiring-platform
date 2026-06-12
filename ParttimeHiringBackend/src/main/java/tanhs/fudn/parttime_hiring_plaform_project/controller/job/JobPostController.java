package tanhs.fudn.parttime_hiring_plaform_project.controller.job;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.JobPostResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.JobPostDetailResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;

import java.text.DecimalFormat;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.data.jpa.domain.Specification;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostSpecification;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobCategoryRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.WorkShiftRepository;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/jobs")
public class JobPostController {

    private final JobPostRepository jobPostRepository;
    private final JobCategoryRepository categoryRepository;
    private final WorkShiftRepository shiftRepository;

    public JobPostController(JobPostRepository jobPostRepository,
                             JobCategoryRepository categoryRepository,
                             WorkShiftRepository shiftRepository) {
        this.jobPostRepository = jobPostRepository;
        this.categoryRepository = categoryRepository;
        this.shiftRepository = shiftRepository;
    }

    /**
     * API Lấy danh sách tất cả các ngành nghề (Job Categories).
     * @return Danh sách các ngành nghề.
     */
    @GetMapping("/categories")
    public ResponseEntity<?> getCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    /**
     * API Lấy danh sách tất cả các ca làm việc (Work Shifts).
     * @return Danh sách các ca làm việc.
     */
    @GetMapping("/shifts")
    public ResponseEntity<?> getShifts() {
        return ResponseEntity.ok(shiftRepository.findAll());
    }

    /**
     * API Tìm kiếm công việc với nhiều tiêu chí lọc (Tên, Cửa hàng, Ngành nghề, Mức lương, Địa điểm...).
     * @return Danh sách các công việc phù hợp với tiêu chí lọc.
     */
    @GetMapping("/search")
    public ResponseEntity<List<JobPostResponse>> searchJobs(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String storeName,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer shiftId,
            @RequestParam(required = false) BigDecimal minWage,
            @RequestParam(required = false) BigDecimal maxWage,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String ward,
            @RequestParam(required = false) String streetAddress
    ) {
        Specification<JobPost> spec = 
            JobPostSpecification.filterJobs(
                title, storeName, categoryId, shiftId, minWage, maxWage, city, district, ward, streetAddress
            );

        List<JobPost> jobPosts = jobPostRepository.findAll(spec);
        DecimalFormat df = new DecimalFormat("#,###");

        List<JobPostResponse> dtos = jobPosts.stream().map(job -> {
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

            return JobPostResponse.builder()
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

    /**
     * API Lấy danh sách tất cả các bài đăng tuyển dụng.
     * @return Danh sách chi tiết các công việc.
     */
    @GetMapping
    public ResponseEntity<List<JobPostResponse>> getAllJobs() {
        List<JobPost> jobPosts = jobPostRepository.findAll();
        DecimalFormat df = new DecimalFormat("#,###");

        List<JobPostResponse> dtos = jobPosts.stream().map(job -> {
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

            return JobPostResponse.builder()
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
    
    /**
     * API Lấy thông tin chi tiết của một bài đăng tuyển dụng cụ thể theo ID.
     * @param id ID của bài đăng tuyển dụng.
     * @return Chi tiết công việc tương ứng.
     */
    @GetMapping("/{id}")
    public ResponseEntity<JobPostDetailResponse> getJobById(@PathVariable Integer id) {
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

        JobPostDetailResponse detail = JobPostDetailResponse.builder()
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
