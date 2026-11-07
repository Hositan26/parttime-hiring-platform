package tanhs.fudn.parttime_hiring_plaform_project.service.impl.admin;
import java.time.LocalDateTime;
import java.util.HashSet;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.verification.VerificationDetailResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.verification.VerificationListResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.EmployerVerification;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmployerStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.VerificationStatus;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.exception.ResourceNotFoundException;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.EmployerVerificationMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerVerificationRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.RoleRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminEmployerVerificationService;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.EmailService;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminEmployerVerificationServiceImpl implements AdminEmployerVerificationService {
    private final EmployerVerificationRepository verifications;
    private final EmployerRepository employers;
    private final UserRepository users;
    private final RoleRepository roles;
    private final EmployerVerificationMapper mapper;
    private final ApplicationEventPublisher events;

    // Returns paginated verification summaries for administration review.
    public Page<VerificationListResponse> getVerifications(VerificationStatus status, int page, int size, String query) {
        if (page < 0 || size < 1 || size > 50) throw new IllegalArgumentException("Invalid pagination");
        return verifications.searchAdministration(status, query == null ? "" : query.trim(),
                PageRequest.of(page, size, Sort.by("verificationId").descending())).map(mapper::toList);
    }

    // Returns documents belonging to a selected verification application.
    public VerificationDetailResponse getVerificationDetail(Integer id) {
        return mapper.toDetail(verifications.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Verification not found")));
    }

    // Approves a pending application and grants employer access atomically.
    @Transactional
    public void approveVerification(Integer id, String adminUsername) {
        var verification = pending(id);
        var applicant = verification.getUser();
        if (!Boolean.TRUE.equals(applicant.getIsActive())) throw new BusinessException("Account is disabled");
        var employer = employers.findByUserId(applicant.getId().intValue())
                .orElseGet(() -> mapper.toEmployer(verification));
        employer.setCompanyName(verification.getCompanyName());
        employer.setTaxCode(verification.getTaxCode());
        employer.setRepresentativeName(verification.getRepresentativeName());
        employer.setEmailContact(verification.getContactEmail());
        employer.setPhoneContact(verification.getPhoneContact());
        employer.setStatus(EmployerStatus.ACTIVE);
        employers.save(employer);
        var granted = new HashSet<>(applicant.getRoles());
        granted.add(roles.findById("EMPLOYER").orElseThrow(() -> new BusinessException("Employer role is unavailable")));
        applicant.setRoles(granted);
        users.save(applicant);
        finish(verification, adminUsername, VerificationStatus.APPROVED, null);
    }

    // Rejects a pending application while preserving existing account privileges.
    @Transactional
    public void rejectVerification(Integer id, String reason, String adminUsername) {
        if (reason == null || reason.isBlank()) throw new BusinessException("Rejection reason is required");
        finish(pending(id), adminUsername, VerificationStatus.REJECTED, reason.trim());
    }

    // Locks the verification row before checking its current review state.
    private EmployerVerification pending(Integer id) {
        var verification = verifications.lockById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Verification not found"));
        if (verification.getVerificationStatus() != VerificationStatus.PENDING) {
            throw new BusinessException("Verification has already been reviewed");
        }
        return verification;
    }

    // Records the reviewer and publishes notification only after transaction commit.
    private void finish(EmployerVerification verification, String admin, VerificationStatus status, String reason) {
        verification.setAdmin(users.findByUsername(admin).orElseThrow(() -> new ResourceNotFoundException("Admin not found")));
        verification.setVerificationStatus(status);
        verification.setRejectionReason(reason);
        verification.setVerifiedAt(LocalDateTime.now());
        verifications.save(verification);
        events.publishEvent(new VerificationDecision(verification.getContactEmail(), verification.getCompanyName(),
                status == VerificationStatus.APPROVED, reason));
    }

    public record VerificationDecision(String email, String company, boolean approved, String reason) {}
}
