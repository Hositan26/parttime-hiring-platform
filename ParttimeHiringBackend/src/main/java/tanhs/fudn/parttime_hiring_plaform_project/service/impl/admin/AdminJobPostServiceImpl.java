package tanhs.fudn.parttime_hiring_plaform_project.service.impl.admin;

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

@Service
@RequiredArgsConstructor
public class AdminJobPostServiceImpl implements AdminJobPostService {

    private final JobPostRepository jobPostRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<AdminJobPostResponse> getAllJobPosts(int page, int size, JobStatus status) {
        Page<JobPost> jobPosts;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("jobPostId").descending());
        
        if (status != null) {
            jobPosts = jobPostRepository.findByStatus(status, pageRequest);
        } else {
            jobPosts = jobPostRepository.findAll(pageRequest);
        }

        return jobPosts.map(job -> AdminJobPostResponse.builder()
                .jobId(job.getJobPostId())
                .title(job.getTitle())
                .employmentType(job.getEmploymentType())
                .hourlyWageMin(job.getHourlyWageMin())
                .hourlyWageMax(job.getHourlyWageMax())
                .vacancyCount(job.getVacancyCount())
                .status(job.getStatus())
                .expiredAt(job.getExpiredAt())
                .createdAt(job.getCreatedAt())
                .employerId(job.getEmployer().getEmployerId())
                .companyName(job.getEmployer().getCompanyName())
                .build());
    }

    @Override
    @Transactional
    public AdminJobPostResponse updateJobPostStatus(Integer jobId, JobStatus status) {
        JobPost jobPost = jobPostRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tin tuyển dụng"));
        
        jobPost.setStatus(status);
        jobPostRepository.save(jobPost);

        return AdminJobPostResponse.builder()
                .jobId(jobPost.getJobPostId())
                .title(jobPost.getTitle())
                .employmentType(jobPost.getEmploymentType())
                .hourlyWageMin(jobPost.getHourlyWageMin())
                .hourlyWageMax(jobPost.getHourlyWageMax())
                .vacancyCount(jobPost.getVacancyCount())
                .status(jobPost.getStatus())
                .expiredAt(jobPost.getExpiredAt())
                .createdAt(jobPost.getCreatedAt())
                .employerId(jobPost.getEmployer().getEmployerId())
                .companyName(jobPost.getEmployer().getCompanyName())
                .build();
    }

    @Override
    @Transactional
    public void deleteJobPost(Integer jobId) {
        if (!jobPostRepository.existsById(jobId)) {
            throw new RuntimeException("Không tìm thấy tin tuyển dụng");
        }
        jobPostRepository.deleteById(jobId);
    }
}
