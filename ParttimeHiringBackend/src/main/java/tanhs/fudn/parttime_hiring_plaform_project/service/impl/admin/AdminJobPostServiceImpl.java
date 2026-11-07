package tanhs.fudn.parttime_hiring_plaform_project.service.impl.admin;

import lombok.extern.slf4j.Slf4j;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmployerStatus;
import tanhs.fudn.parttime_hiring_plaform_project.exception.ResourceNotFoundException;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.AdminJobPostMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.SavedJobRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.application.RecruitmentInteractionRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.application.JobApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.jobpost.AdminJobPostResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminJobPostService;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminJobPostServiceImpl implements AdminJobPostService {

    private final JobPostRepository jobPostRepository;
    private final JobApplicationRepository applications;
    private final RecruitmentInteractionRepository interactions;
    private final SavedJobRepository favorites;
    private final AdminJobPostMapper mapper;

    // Searches listing titles with bounded pagination and exact backend states.
    @Override
    @Transactional(readOnly = true)
    public Page<AdminJobPostResponse> getAllJobPosts(int page, int size, JobStatus status, String query) {
        if (page < 0 || size < 1 || size > 50) throw new IllegalArgumentException("Invalid pagination");
        return jobPostRepository.searchAdministration(query == null ? "" : query.trim(), status,
                PageRequest.of(page, size, Sort.by("jobPostId").descending())).map(mapper::toResponse);
    }

    // Returns listing details without applying public availability restrictions.
    @Transactional(readOnly = true)
    public AdminJobPostResponse getDetail(Integer jobId) {
        return mapper.toResponse(jobPostRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found")));
    }

    // Updates a listing publication state for administration moderation.
    @Override
    @Transactional
    public AdminJobPostResponse updateJobPostStatus(Integer jobId, JobStatus status) {
        JobPost jobPost = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tin tuyển dụng"));

        if (status != JobStatus.ACTIVE && status != JobStatus.PAUSED) {
            throw new IllegalArgumentException("Moderation supports PAUSED removal or ACTIVE restoration");
        }
        if (status == JobStatus.ACTIVE) {
            var now = java.time.LocalDateTime.now();
            if (jobPost.getExpiredAt() == null || !jobPost.getExpiredAt().isAfter(now)
                    || (jobPost.getPublishedAt() != null && jobPost.getPublishedAt().isAfter(now))
                    || !Boolean.TRUE.equals(jobPost.getStore().getIsApproved())
                    || !Boolean.TRUE.equals(jobPost.getStore().getIsActive())
                    || jobPost.getEmployer().getStatus() != EmployerStatus.ACTIVE) {
                throw new BusinessException("Listing is not eligible for restoration");
            }
        }
        jobPost.setModerationBlocked(status == JobStatus.PAUSED);
        jobPost.setStatus(status);
        jobPostRepository.save(jobPost);

        return mapper.toResponse(jobPost);
    }

    // Keeps applications, conversations, reports and favorites when deleting listings.
    @Override
    @Transactional
    public void deleteJobPost(Integer jobId) {
        var job = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        if (applications.countByJobPost_JobPostId(jobId) > 0 || interactions.existsByJobPost_JobPostId(jobId)
                || favorites.existsByJobPost_JobPostId(jobId)) {
            throw new BusinessException("Listing has dependent history; remove it from publication instead");
        }
        jobPostRepository.delete(job);
    }
}
