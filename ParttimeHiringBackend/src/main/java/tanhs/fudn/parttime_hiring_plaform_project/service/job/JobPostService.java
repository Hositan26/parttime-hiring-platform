package tanhs.fudn.parttime_hiring_plaform_project.service.job;

import tanhs.fudn.parttime_hiring_plaform_project.service.job.JobPostService;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.job.CategoryResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.job.JobPostDetailResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.job.JobPostResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.job.ShiftResponse;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.domain.Page;

public interface JobPostService {
    // Returns a bounded, consistently ordered page of filtered public jobs.
    Page<JobPostResponse> searchJobPage(String title, String storeName,
            Integer categoryId, Integer shiftId, BigDecimal minWage, BigDecimal maxWage,
            String city, String district, String ward, String streetAddress, int page, int size);
    List<CategoryResponse> getCategories();
    List<ShiftResponse> getShifts();
    List<JobPostResponse> searchJobs(String title, String storeName, Integer categoryId, Integer shiftId,
                                            BigDecimal minWage, BigDecimal maxWage, String city, String district,
                                            String ward, String streetAddress);
    List<JobPostResponse> getAllJobs();
    JobPostDetailResponse getJobById(Integer id);
}
