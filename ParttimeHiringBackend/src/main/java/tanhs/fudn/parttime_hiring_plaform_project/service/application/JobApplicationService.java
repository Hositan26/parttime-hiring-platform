package tanhs.fudn.parttime_hiring_plaform_project.service.application;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.dto.application.JobApplicationRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.application.JobApplicationResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.application.JobApplication;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.ApplicationStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.repository.application.JobApplicationRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.JobApplicationMapper;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final JobPostRepository jobPostRepository;
    private final UserRepository userRepository;
    private final JobApplicationMapper applicationMapper;

    public JobApplicationService(JobApplicationRepository applicationRepository,
                                 JobPostRepository jobPostRepository,
                                 UserRepository userRepository,
                                 JobApplicationMapper applicationMapper) {
        this.applicationRepository = applicationRepository;
        this.jobPostRepository = jobPostRepository;
        this.userRepository = userRepository;
        this.applicationMapper = applicationMapper;
    }

    @Transactional
    public void applyForJob(JobApplicationRequest request, String username) {
        User applicant = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng."));

        JobPost jobPost = jobPostRepository.findById(request.getJobPostId())
                .orElseThrow(() -> new RuntimeException("Công việc không tồn tại hoặc đã bị xóa."));

        // Anti-spam: Check if the user has already applied for this job
        boolean alreadyApplied = applicationRepository.existsByJobPost_JobPostIdAndApplicant_Id(
                jobPost.getJobPostId(), applicant.getId()
        );

        if (alreadyApplied) {
            throw new RuntimeException("Bạn đã ứng tuyển công việc này rồi. Vui lòng kiểm tra trong danh sách đã nộp.");
        }

        JobApplication application = JobApplication.builder()
                .jobPost(jobPost)
                .applicant(applicant)
                .contactPhone(request.getContactPhone())
                .note(request.getNote())
                .status(ApplicationStatus.PENDING)
                .build();

        applicationRepository.save(application);
    }

    public List<JobApplicationResponse> getMyApplications(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<JobApplication> applications = applicationRepository.findByApplicant_IdOrderByAppliedAtDesc(user.getId());

        return applications.stream()
                .map(applicationMapper::toJobApplicationResponse)
                .collect(Collectors.toList());
    }
}
