package tanhs.fudn.parttime_hiring_plaform_project.service.employer;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer.job.CreateEmployerJobRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer.job.UpdateEmployerJobRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.job.*;
import tanhs.fudn.parttime_hiring_plaform_project.entity.application.JobApplication;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Store;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobCategory;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPostImage;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.WorkShift;
import tanhs.fudn.parttime_hiring_plaform_project.entity.review.StoreReview;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.EmployerJobMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.application.JobApplicationRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.StoreRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobCategoryRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.WorkShiftRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.review.StoreReviewRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmployerJobService {

    UserRepository userRepository;
    EmployerRepository employerRepository;
    JobPostRepository jobPostRepository;
    StoreRepository storeRepository;
    StoreReviewRepository storeReviewRepository;
    JobApplicationRepository jobApplicationRepository;
    JobCategoryRepository jobCategoryRepository;
    WorkShiftRepository workShiftRepository;
    EmployerJobMapper employerJobMapper;

    private Employer getEmployerByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng."));
        return employerRepository.findByUserId(user.getId().intValue())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin nhà tuyển dụng."));
    }

    @Transactional(readOnly = true)
    public Page<EmployerJobListResponse> getEmployerJobs(String username, int page, int size, Integer storeId, tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus status) {
        Employer employer = getEmployerByUsername(username);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        org.springframework.data.jpa.domain.Specification<JobPost> spec = tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostSpecification.filterEmployerJobs(employer.getEmployerId(), storeId, status);
        Page<JobPost> jobPosts = jobPostRepository.findAll(spec, pageable);
        
        return jobPosts.map(job -> {
            int applicantsCount = (int) jobApplicationRepository.countByJobPost_JobPostId(job.getJobPostId());
            return employerJobMapper.toListResponse(job, applicantsCount);
        });
    }

    @Transactional(readOnly = true)
    public EmployerJobDetailResponse getEmployerJobDetail(String username, Integer jobId) {
        Employer employer = getEmployerByUsername(username);
        JobPost jobPost = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tin tuyển dụng."));

        if (!jobPost.getEmployer().getEmployerId().equals(employer.getEmployerId())) {
            throw new RuntimeException("Bạn không có quyền xem tin tuyển dụng này.");
        }

        int applicantsCount = (int) jobApplicationRepository.countByJobPost_JobPostId(jobId);
        return employerJobMapper.toDetailResponse(jobPost, applicantsCount);
    }

    @Transactional(readOnly = true)
    public List<EmployerJobCommentResponse> getJobComments(String username, Integer jobId) {
        Employer employer = getEmployerByUsername(username);
        JobPost jobPost = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tin tuyển dụng."));
        
        if (!jobPost.getEmployer().getEmployerId().equals(employer.getEmployerId())) {
            throw new RuntimeException("Bạn không có quyền xem đánh giá của tin tuyển dụng này.");
        }

        List<StoreReview> reviews = storeReviewRepository.findByEmploymentRecord_JobPost_JobPostIdOrderByCreatedAtDesc(jobId);
        return reviews.stream().map(employerJobMapper::toCommentResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EmployerJobApplicantResponse> getJobApplicants(String username, Integer jobId) {
        Employer employer = getEmployerByUsername(username);
        JobPost jobPost = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tin tuyển dụng."));
        
        if (!jobPost.getEmployer().getEmployerId().equals(employer.getEmployerId())) {
            throw new RuntimeException("Bạn không có quyền xem ứng viên của tin tuyển dụng này.");
        }

        List<JobApplication> applications = jobApplicationRepository.findByJobPost_JobPostIdOrderByAppliedAtDesc(jobId);
        return applications.stream().map(employerJobMapper::toApplicantResponse).collect(Collectors.toList());
    }

    @Transactional
    public EmployerJobDetailResponse createEmployerJob(String username, CreateEmployerJobRequest request) {
        Employer employer = getEmployerByUsername(username);
        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cửa hàng."));

        if (!store.getEmployer().getEmployerId().equals(employer.getEmployerId())) {
            throw new RuntimeException("Bạn không có quyền tạo việc làm cho cửa hàng này.");
        }

        JobPost jobPost = employerJobMapper.toEntity(request);
        jobPost.setEmployer(employer);
        jobPost.setStore(store);
        jobPost.setStatus(JobStatus.ACTIVE);
        jobPost.setPublishedAt(LocalDateTime.now());
        jobPost.setCurrency("VND");

        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            List<JobCategory> categories = jobCategoryRepository.findAllById(request.getCategoryIds());
            jobPost.setCategories(categories);
        }

        if (request.getShiftIds() != null && !request.getShiftIds().isEmpty()) {
            List<WorkShift> shifts = workShiftRepository.findAllById(request.getShiftIds());
            jobPost.setShifts(shifts);
        }

        jobPost = jobPostRepository.save(jobPost);
        return employerJobMapper.toDetailResponse(jobPost, 0);
    }

    @Transactional
    public EmployerJobDetailResponse updateEmployerJob(String username, Integer jobId, UpdateEmployerJobRequest request) {
        Employer employer = getEmployerByUsername(username);
        JobPost jobPost = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tin tuyển dụng."));

        if (!jobPost.getEmployer().getEmployerId().equals(employer.getEmployerId())) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa tin tuyển dụng này.");
        }

        // Apply new status logic if provided
        if (request.getStatus() != null) {
            if (jobPost.getStatus() == JobStatus.EXPIRED && request.getStatus() == JobStatus.ACTIVE) {
                if (request.getExpiredAt() != null && !request.getExpiredAt().isAfter(LocalDate.now())) {
                    throw new RuntimeException("Không thể kích hoạt lại tin đã hết hạn. Vui lòng gia hạn ngày nộp hồ sơ.");
                }
            }
            jobPost.setStatus(request.getStatus());
        }

        // If the date is explicitly set to past, auto change to EXPIRED
        if (request.getExpiredAt() != null && request.getExpiredAt().isBefore(LocalDate.now())) {
            jobPost.setStatus(JobStatus.EXPIRED);
        }

        employerJobMapper.updateEntityFromRequest(request, jobPost);

        if (request.getCategoryIds() != null) {
            List<JobCategory> categories = jobCategoryRepository.findAllById(request.getCategoryIds());
            jobPost.setCategories(categories);
        }

        if (request.getShiftIds() != null) {
            List<WorkShift> shifts = workShiftRepository.findAllById(request.getShiftIds());
            jobPost.setShifts(shifts);
        }

        jobPost = jobPostRepository.save(jobPost);
        int applicantsCount = (int) jobApplicationRepository.countByJobPost_JobPostId(jobId);
        return employerJobMapper.toDetailResponse(jobPost, applicantsCount);
    }

    @Transactional
    public void addJobImage(String username, Integer jobId, String imageUrl) {
        Employer employer = getEmployerByUsername(username);
        JobPost jobPost = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tin tuyển dụng."));

        if (!jobPost.getEmployer().getEmployerId().equals(employer.getEmployerId())) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa tin tuyển dụng này.");
        }

        JobPostImage newImage = JobPostImage.builder()
                .imageUrl(imageUrl)
                .sortOrder(jobPost.getImages() != null ? jobPost.getImages().size() : 0)
                .jobPost(jobPost)
                .build();
        
        jobPost.getImages().add(newImage);
        jobPostRepository.save(jobPost);
    }

    @Transactional
    public void deleteJobImage(String username, Integer jobId, Integer imageId) {
        Employer employer = getEmployerByUsername(username);
        JobPost jobPost = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tin tuyển dụng."));

        if (!jobPost.getEmployer().getEmployerId().equals(employer.getEmployerId())) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa tin tuyển dụng này.");
        }

        jobPost.getImages().removeIf(img -> img.getImageId().equals(imageId));
        jobPostRepository.save(jobPost);
    }

    @Transactional
    public void patchJobStatus(String username, Integer jobId, JobStatus newStatus) {
        Employer employer = getEmployerByUsername(username);
        JobPost jobPost = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tin tuyển dụng."));

        if (!jobPost.getEmployer().getEmployerId().equals(employer.getEmployerId())) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa tin tuyển dụng này.");
        }

        if (jobPost.getStatus() == JobStatus.EXPIRED && newStatus == JobStatus.ACTIVE) {
            if (jobPost.getExpiredAt() != null && !jobPost.getExpiredAt().isAfter(LocalDateTime.now())) {
                throw new RuntimeException("Không thể kích hoạt lại tin đã hết hạn. Vui lòng gia hạn ngày nộp hồ sơ.");
            }
        }
        
        jobPost.setStatus(newStatus);
        jobPostRepository.save(jobPost);
    }

    @Transactional
    public void deleteJob(String username, Integer jobId) {
        Employer employer = getEmployerByUsername(username);
        JobPost jobPost = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tin tuyển dụng."));

        if (!jobPost.getEmployer().getEmployerId().equals(employer.getEmployerId())) {
            throw new RuntimeException("Bạn không có quyền xóa tin tuyển dụng này.");
        }

        long applicationsCount = jobApplicationRepository.countByJobPost_JobPostId(jobId);
        if (applicationsCount > 0) {
            throw new RuntimeException("Không thể xóa tin tuyển dụng đã có người ứng tuyển.");
        }

        jobPostRepository.delete(jobPost);
    }
}
