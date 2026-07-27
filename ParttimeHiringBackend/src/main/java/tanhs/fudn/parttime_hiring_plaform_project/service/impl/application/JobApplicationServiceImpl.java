package tanhs.fudn.parttime_hiring_plaform_project.service.impl.application;

import tanhs.fudn.parttime_hiring_plaform_project.service.application.JobApplicationService;


import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.application.JobApplicationRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.application.JobApplicationResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.application.EmployerApplicationResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.application.JobApplication;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employment.EmploymentRecord;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.ApplicationStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.WorkStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.repository.application.JobApplicationRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employment.EmploymentRecordRepository;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.JobApplicationMapper;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobApplicationServiceImpl implements JobApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final JobPostRepository jobPostRepository;
    private final UserRepository userRepository;
    private final EmployerRepository employerRepository;
    private final JobApplicationMapper applicationMapper;
    private final EmploymentRecordRepository employmentRecordRepository;

    public JobApplicationServiceImpl(JobApplicationRepository applicationRepository,
                                 JobPostRepository jobPostRepository,
                                 UserRepository userRepository,
                                 EmployerRepository employerRepository,
                                 JobApplicationMapper applicationMapper,
                                 EmploymentRecordRepository employmentRecordRepository) {
        this.applicationRepository = applicationRepository;
        this.jobPostRepository = jobPostRepository;
        this.userRepository = userRepository;
        this.employerRepository = employerRepository;
        this.applicationMapper = applicationMapper;
        this.employmentRecordRepository = employmentRecordRepository;
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

    public List<EmployerApplicationResponse> getApplicationsForEmployer(String username, Integer storeId, ApplicationStatus status) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Employer employer = employerRepository.findByUserId(user.getId().intValue())
                .orElseThrow(() -> new RuntimeException("Người dùng chưa có hồ sơ nhà tuyển dụng."));

        List<JobApplication> applications = applicationRepository.findFilteredApplications(employer.getEmployerId(), storeId, status);

        return applications.stream()
                .map(applicationMapper::toEmployerApplicationResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateApplicationStatus(Integer applicationId, ApplicationStatus status, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Employer employer = employerRepository.findByUserId(user.getId().intValue())
                .orElseThrow(() -> new RuntimeException("Người dùng chưa có hồ sơ nhà tuyển dụng."));

        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn ứng tuyển."));

        if (!application.getJobPost().getEmployer().getEmployerId().equals(employer.getEmployerId())) {
            throw new RuntimeException("Bạn không có quyền thay đổi trạng thái đơn ứng tuyển này.");
        }

        ApplicationStatus oldStatus = application.getStatus();

        // Cập nhật trạng thái
        application.setStatus(status);
        applicationRepository.save(application);

        // Logic tạo hoặc xóa EmploymentRecord
        if (status == ApplicationStatus.ACCEPTED && oldStatus != ApplicationStatus.ACCEPTED) {
            // Tạo bản ghi nhân sự mới
            EmploymentRecord newRecord = EmploymentRecord.builder()
                    .user(application.getApplicant())
                    .store(application.getJobPost().getStore())
                    .jobPost(application.getJobPost())
                    .application(application)
                    .startDate(LocalDate.now())
                    .workStatus(WorkStatus.WORKING)
                    .verifiedByEmployer(employer)
                    .verifiedAt(LocalDateTime.now())
                    .build();
            employmentRecordRepository.save(newRecord);
        } else if (status == ApplicationStatus.REJECTED && oldStatus == ApplicationStatus.ACCEPTED) {
            // Xóa bản ghi nhân sự nếu click nhầm (undo)
            employmentRecordRepository.findByApplication(application).ifPresent(record -> {
                employmentRecordRepository.delete(record);
            });
        }
    }
}
