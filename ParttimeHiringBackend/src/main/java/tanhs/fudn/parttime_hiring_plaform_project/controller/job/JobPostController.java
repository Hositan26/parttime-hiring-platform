package tanhs.fudn.parttime_hiring_plaform_project.controller.job;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.job.CategoryResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.job.JobPostDetailResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.job.JobPostResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.job.ShiftResponse;
import tanhs.fudn.parttime_hiring_plaform_project.service.job.JobPostService;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class JobPostController {

    JobPostService jobPostService;

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success(jobPostService.getCategories()));
    }

    @GetMapping("/shifts")
    public ResponseEntity<ApiResponse<List<ShiftResponse>>> getShifts() {
        return ResponseEntity.ok(ApiResponse.success(jobPostService.getShifts()));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<JobPostResponse>>> searchJobs(
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
        return ResponseEntity.ok(ApiResponse.success(jobPostService.searchJobs(
                title, storeName, categoryId, shiftId, minWage, maxWage, city, district, ward, streetAddress
        )));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<JobPostResponse>>> getAllJobs() {
        return ResponseEntity.ok(ApiResponse.success(jobPostService.getAllJobs()));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobPostDetailResponse>> getJobById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(jobPostService.getJobById(id)));
    }
}
