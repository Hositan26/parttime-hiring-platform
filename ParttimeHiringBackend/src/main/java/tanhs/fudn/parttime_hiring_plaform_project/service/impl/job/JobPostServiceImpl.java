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

    @Transactional(readOnly = true)
    public List<JobPostResponse> searchJobs(String title, String storeName, Integer categoryId, Integer shiftId,
                                            BigDecimal minWage, BigDecimal maxWage, String city, String district,
                                            String ward, String streetAddress) {
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

    @Transactional(readOnly = true)
    public JobPostDetailResponse getJobById(Integer id) {
        JobPost job = jobPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job post not found"));
        return jobMapper.toJobPostDetailResponse(job);
    }
}
