package tanhs.fudn.parttime_hiring_plaform_project.service.impl.job;

import tanhs.fudn.parttime_hiring_plaform_project.service.job.JobPostService;


import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.job.CategoryResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.job.JobPostDetailResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.job.JobPostResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.job.ShiftResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.JobMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobCategoryRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostSpecification;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.WorkShiftRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import tanhs.fudn.parttime_hiring_plaform_project.service.job.JobAvailabilityPolicy;
import tanhs.fudn.parttime_hiring_plaform_project.exception.ResourceNotFoundException;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class JobPostServiceImpl implements JobPostService {

    JobPostRepository jobPostRepository;
    JobCategoryRepository categoryRepository;
    WorkShiftRepository shiftRepository;
    JobMapper jobMapper;
    JobAvailabilityPolicy availabilityPolicy;

    // Bounds page sizes and applies filters before fetching public recruitment.
    @Transactional(readOnly = true)
    public Page<JobPostResponse> searchJobPage(String title, String storeName, Integer categoryId,
            Integer shiftId, BigDecimal minWage, BigDecimal maxWage, String city, String district,
            String ward, String streetAddress, int page, int size) {
        if (page < 0 || size < 1 || size > 50) {
            throw new BusinessException("Page must be nonnegative and size must be between 1 and 50.");
        }
        validateFilters(categoryId, shiftId, minWage, maxWage);
        var spec = JobPostSpecification.filterJobs(title, storeName, categoryId, shiftId,
                minWage, maxWage, city, district, ward, streetAddress);
        return jobPostRepository.findAll(spec, PageRequest.of(page, size, Sort.by("jobPostId").descending()))
                .map(jobMapper::toJobPostResponse);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories() {
        return categoryRepository.findAll().stream()
                .map(jobMapper::toCategoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ShiftResponse> getShifts() {
        return shiftRepository.findAll().stream()
                .map(jobMapper::toShiftResponse)
                .collect(Collectors.toList());
    }

    // Validates filter ranges before querying public recruitment opportunities.
    @Transactional(readOnly = true)
    public List<JobPostResponse> searchJobs(String title, String storeName, Integer categoryId, Integer shiftId,
                                            BigDecimal minWage, BigDecimal maxWage, String city, String district,
                                            String ward, String streetAddress) {
        validateFilters(categoryId, shiftId, minWage, maxWage);
        Specification<JobPost> spec = JobPostSpecification.filterJobs(
                title, storeName, categoryId, shiftId, minWage, maxWage, city, district, ward, streetAddress
        );

        return jobPostRepository.findAll(spec).stream()
                .map(jobMapper::toJobPostResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<JobPostResponse> getAllJobs() {
        Specification<JobPost> spec = JobPostSpecification.filterJobs(
                null, null, null, null, null, null, null, null, null, null
        );
        return jobPostRepository.findAll(spec).stream()
                .map(jobMapper::toJobPostResponse)
                .collect(Collectors.toList());
    }

    // Returns public details only while recruitment remains available.
    @Transactional(readOnly = true)
    public JobPostDetailResponse getJobById(Integer id) {
        JobPost job = jobPostRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job post not found"));
        if (!availabilityPolicy.isAvailable(job, LocalDateTime.now())) {
            throw new ResourceNotFoundException("Job post is no longer available");
        }
        return jobMapper.toJobPostDetailResponse(job);
    }

    // Rejects invalid wage intervals and nonpositive category or shift identifiers.
    private void validateFilters(Integer categoryId, Integer shiftId, BigDecimal minWage, BigDecimal maxWage) {
        if ((minWage != null && minWage.signum() < 0) || (maxWage != null && maxWage.signum() < 0)
                || (minWage != null && maxWage != null && minWage.compareTo(maxWage) > 0)
                || (categoryId != null && categoryId <= 0) || (shiftId != null && shiftId <= 0)) {
            throw new BusinessException("Bộ lọc mức lương hoặc ngành nghề/ca làm không hợp lệ.");
        }
    }
}
