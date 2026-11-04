package tanhs.fudn.parttime_hiring_plaform_project.service.impl.application;

import org.springframework.security.access.AccessDeniedException;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.application.ApplicationUpdateRequest;
import tanhs.fudn.parttime_hiring_plaform_project.service.job.JobAvailabilityPolicy;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.exception.ResourceNotFoundException;

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
    private final JobAvailabilityPolicy availabilityPolicy;

    // Changes contact details only before the employer has decided.
    @Transactional
    public void editApplication(Integer id, ApplicationUpdateRequest request, String username) {
        JobApplication application = ownedPendingApplication(id, username);
        applicationMapper.updateContact(request, application);
        applicationRepository.save(application);
    }

    // Preserves a withdrawn application instead of deleting recruitment history.
    @Transactional
    public void withdrawApplication(Integer id, String username) {
        JobApplication application = ownedPendingApplication(id, username);
        application.setStatus(ApplicationStatus.WITHDRAWN);
        applicationRepository.save(application);
    }

    // Locks the application and checks candidate ownership and pending state.
    private JobApplication ownedPendingApplication(Integer id, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        JobApplication application = applicationRepository.lockById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        if (!application.getApplicant().getId().equals(user.getId())) {
            throw new AccessDeniedException("Application belongs to another candidate");
        }
        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new BusinessException("Only pending applications can be edited or withdrawn");
        }
        return application;
    }

    // Connects recruitment validation, application persistence, and employment processing.
    public JobApplicationServiceImpl(JobApplicationRepository applicationRepository,
                                 JobPostRepository jobPostRepository,
                                 UserRepository userRepository,
                                 EmployerRepository employerRepository,
                                 JobApplicationMapper applicationMapper,
                                 EmploymentRecordRepository employmentRecordRepository,
                                 JobAvailabilityPolicy availabilityPolicy) {
        this.applicationRepository = applicationRepository;
        this.jobPostRepository = jobPostRepository;
        this.userRepository = userRepository;
        this.employerRepository = employerRepository;
        this.applicationMapper = applicationMapper;
        this.employmentRecordRepository = employmentRecordRepository;
        this.availabilityPolicy = availabilityPolicy;
    }

    // Serializes candidate submissions before checking availability and duplicate applications.
    @Transactional
    public void applyForJob(JobApplicationRequest request, String username) {
        User applicant = userRepository.lockByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng."));

        JobPost jobPost = jobPostRepository.findById(request.getJobPostId())
                .orElseThrow(() -> new ResourceNotFoundException("Công việc không tồn tại hoặc đã bị xóa."));

        if (!availabilityPolicy.isAvailable(jobPost, LocalDateTime.now())) {
            throw new BusinessException("Công việc hiện không nhận đơn ứng tuyển.");
        }

        // Anti-spam: Check if the user has already applied for this job
        boolean alreadyApplied = applicationRepository.existsByJobPost_JobPostIdAndApplicant_Id(
                jobPost.getJobPostId(), applicant.getId()
        );

        if (alreadyApplied) {
            throw new BusinessException("Bạn đã ứng tuyển công việc này rồi. Vui lòng kiểm tra trong danh sách đã nộp.");
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

    // Queries application history using the authenticated account identifier only.
    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getMyApplications(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

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

    // Updates an owned application and synchronizes employment records.
    @Transactional
    public void updateApplicationStatus(Integer applicationId, ApplicationStatus status, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Employer employer = employerRepository.findByUserId(user.getId().intValue())
                .orElseThrow(() -> new RuntimeException("Người dùng chưa có hồ sơ nhà tuyển dụng."));

        JobApplication application = applicationRepository.lockById(applicationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn ứng tuyển."));

        if (!application.getJobPost().getEmployer().getEmployerId().equals(employer.getEmployerId())) {
            throw new AccessDeniedException("Bạn không có quyền thay đổi trạng thái đơn ứng tuyển này.");
        }

        ApplicationStatus oldStatus = application.getStatus();
        if (oldStatus == ApplicationStatus.ACCEPTED && status != ApplicationStatus.ACCEPTED) {
            throw new BusinessException("Accepted applications retain their employment history");
        }
        if (oldStatus == ApplicationStatus.WITHDRAWN
                || (status != ApplicationStatus.ACCEPTED && status != ApplicationStatus.REJECTED)) {
            throw new BusinessException("This application decision is not allowed");
        }

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
        }
    }
}
