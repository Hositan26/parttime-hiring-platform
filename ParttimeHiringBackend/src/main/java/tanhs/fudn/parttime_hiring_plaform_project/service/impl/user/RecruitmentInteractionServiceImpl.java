package tanhs.fudn.parttime_hiring_plaform_project.service.impl.user;

import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import tanhs.fudn.parttime_hiring_plaform_project.entity.application.JobApplication;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.ApplicationStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.InteractionKind;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.InteractionStatus;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.user.InteractionRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.InteractionResponse;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.exception.ResourceNotFoundException;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.RecruitmentInteractionMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.application.JobApplicationRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.application.RecruitmentInteractionRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.RecruitmentInteractionService;

@Service @RequiredArgsConstructor @Slf4j
public class RecruitmentInteractionServiceImpl implements RecruitmentInteractionService {
    private final UserRepository users;
    private final JobPostRepository jobs;
    private final JobApplicationRepository applications;
    private final RecruitmentInteractionRepository interactions;
    private final RecruitmentInteractionMapper mapper;

    // Restricts conversation history to the actual candidate and employer.
    @Transactional(readOnly = true)
    public Page<InteractionResponse> conversation(String username, Integer applicationId, int page) {
        var user = account(username); participant(user, applicationId);
        return interactions.findByApplication_ApplicationId(applicationId, paging(page)).map(mapper::toResponse);
    }

    // Resolves recipients from the application rather than trusting client identifiers.
    @Transactional
    public InteractionResponse send(String username, Integer applicationId, InteractionRequest request, InteractionKind kind) {
        var user = account(username); var application = participant(user, applicationId);
        if (application.getStatus() != ApplicationStatus.PENDING && application.getStatus() != ApplicationStatus.ACCEPTED) {
            throw new BusinessException("This application no longer accepts conversations");
        }
        if (kind != InteractionKind.MESSAGE && kind != InteractionKind.INTERVIEW) throw new BusinessException("Invalid conversation type");
        if (kind == InteractionKind.INTERVIEW && (request.getMeetingAt() == null || !request.getMeetingAt().isAfter(LocalDateTime.now()))) {
            throw new BusinessException("Interview time must be in the future");
        }
        Long recipientId = application.getApplicant().getId().equals(user.getId())
                ? application.getJobPost().getEmployer().getUserId().longValue() : application.getApplicant().getId();
        var recipient = users.findById(recipientId).orElseThrow(() -> new ResourceNotFoundException("Recipient not found"));
        var interaction = mapper.create(request, user, recipient, application, application.getJobPost(), kind);
        if (kind == InteractionKind.MESSAGE) interaction.setMeetingAt(null);
        return mapper.toResponse(interactions.save(interaction));
    }

    // Serializes appointment responses and prevents authors from accepting their own invitations.
    @Transactional
    public InteractionResponse respond(String username, Long id, InteractionStatus status) {
        var user = account(username);
        var item = interactions.lockById(id).orElseThrow(() -> new ResourceNotFoundException("Interview not found"));
        if (item.getKind() != InteractionKind.INTERVIEW) throw new BusinessException("Not an interview");
        participant(user, item.getApplication().getApplicationId());
        boolean open = item.getStatus() == InteractionStatus.OPEN;
        boolean cancellation = status == InteractionStatus.CANCELLED && (open || item.getStatus() == InteractionStatus.ACCEPTED);
        boolean decision = open && item.getRecipient().getId().equals(user.getId())
                && (status == InteractionStatus.ACCEPTED || status == InteractionStatus.DECLINED);
        if ((!cancellation && !decision) || !item.getMeetingAt().isAfter(LocalDateTime.now())) {
            throw new BusinessException("Interview response is not allowed");
        }
        item.setStatus(status);
        return mapper.toResponse(interactions.save(item));
    }

    // Limits open reports to one per reporter and recruitment opportunity.
    @Transactional
    public InteractionResponse report(String username, Integer jobId, InteractionRequest request) {
        var user = users.lockByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        var job = jobs.findById(jobId).orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        if (interactions.existsByAuthor_IdAndJobPost_JobPostIdAndKindAndStatus(user.getId(), jobId, InteractionKind.REPORT, InteractionStatus.OPEN)) {
            throw new BusinessException("An open report already exists for this job");
        }
        var report = mapper.create(request, user, null, null, job, InteractionKind.REPORT);
        report.setMeetingAt(null);
        return mapper.toResponse(interactions.save(report));
    }

    // Lists private reports belonging to the current reporter.
    @Transactional(readOnly = true)
    public Page<InteractionResponse> reports(String username, int page) {
        return interactions.findByAuthor_IdAndKind(account(username).getId(), InteractionKind.REPORT, paging(page)).map(mapper::toResponse);
    }

    // Exposes moderation reports exclusively to administrator authorities.
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public Page<InteractionResponse> adminReports(int page) {
        return interactions.findByKind(InteractionKind.REPORT, paging(page)).map(mapper::toResponse);
    }

    // Marks a moderation report resolved without deleting the original complaint.
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void resolveReport(Long id) {
        var item = interactions.lockById(id).orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        if (item.getKind() != InteractionKind.REPORT) throw new BusinessException("Not a report");
        item.setStatus(InteractionStatus.RESOLVED); interactions.save(item);
    }

    // Loads the authenticated account without exposing credentials.
    private User account(String username) {
        return users.findByUsername(username).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    // Rejects application identifiers belonging to unrelated recruitment participants.
    private JobApplication participant(User user, Integer id) {
        var application = applications.findById(id).orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        if (!application.getApplicant().getId().equals(user.getId())
                && application.getJobPost().getEmployer().getUserId().longValue() != user.getId()) {
            throw new AccessDeniedException("Application conversation is private");
        }
        return application;
    }

    // Bounds history pages and orders interactions consistently by newest entry.
    private PageRequest paging(int page) {
        if (page < 0) throw new BusinessException("Invalid page number");
        return PageRequest.of(page, 20, Sort.by("id").descending());
    }
}
