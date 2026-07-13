package tanhs.fudn.parttime_hiring_plaform_project.service.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.dto.admin.verification.VerificationDetailResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.admin.verification.VerificationListResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.EmployerVerification;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmployerStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.VerificationStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerVerificationRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;

@Service
@RequiredArgsConstructor
public class AdminEmployerVerificationService {

    private final EmployerVerificationRepository verificationRepository;
    private final EmployerRepository employerRepository;
    private final UserRepository userRepository;

    public Page<VerificationListResponse> getVerifications(VerificationStatus status, int page, int size) {
        Page<EmployerVerification> verifications = verificationRepository.findByVerificationStatus(
                status, 
                PageRequest.of(page, size, Sort.by("verificationId").descending())
        );

        return verifications.map(v -> VerificationListResponse.builder()
                .verificationId(v.getVerificationId())
                .userId(v.getUser().getId())
                .username(v.getUser().getUsername())
                .companyName(v.getCompanyName())
                .taxCode(v.getTaxCode())
                .submittedAt(v.getSubmittedAt() != null ? v.getSubmittedAt().toString() : null)
                .status(v.getVerificationStatus())
                .build());
    }

    public VerificationDetailResponse getVerificationDetail(Integer id) {
        EmployerVerification v = verificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn xác minh"));

        return VerificationDetailResponse.builder()
                .verificationId(v.getVerificationId())
                .userId(v.getUser().getId())
                .username(v.getUser().getUsername())
                .email(v.getUser().getEmail())
                .contactEmail(v.getContactEmail())
                .phoneContact(v.getPhoneContact())
                .address(v.getAddress())
                .companyName(v.getCompanyName())
                .representativeName(v.getRepresentativeName())
                .taxCode(v.getTaxCode())
                .websiteFanpageUrl(v.getWebsiteFanpageUrl())
                .storeFrontImageUrl(v.getStoreFrontImageUrl())
                .idCardFrontUrl(v.getIdCardFrontUrl())
                .idCardBackUrl(v.getIdCardBackUrl())
                .businessLicenseUrl(v.getBusinessLicenseUrl())
                .status(v.getVerificationStatus())
                .submittedAt(v.getSubmittedAt() != null ? v.getSubmittedAt().toString() : null)
                .build();
    }

    @Transactional
    public void approveVerification(Integer id, String adminUsername) {
        EmployerVerification verification = verificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn xác minh"));

        if (verification.getVerificationStatus() != VerificationStatus.PENDING) {
            throw new RuntimeException("Đơn này không ở trạng thái chờ duyệt");
        }

        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new RuntimeException("Admin không tồn tại"));

        verification.setVerificationStatus(VerificationStatus.APPROVED);
        verification.setAdmin(admin);
        verificationRepository.save(verification);

        // Update Employer entity
        Employer employer = employerRepository.findByUserId(verification.getUser().getId().intValue())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ doanh nghiệp của user này"));

        employer.setCompanyName(verification.getCompanyName());
        employer.setTaxCode(verification.getTaxCode());
        employer.setRepresentativeName(verification.getRepresentativeName());
        employer.setStatus(EmployerStatus.ACTIVE);
        employerRepository.save(employer);
    }

    @Transactional
    public void rejectVerification(Integer id, String reason, String adminUsername) {
        EmployerVerification verification = verificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn xác minh"));

        if (verification.getVerificationStatus() != VerificationStatus.PENDING) {
            throw new RuntimeException("Đơn này không ở trạng thái chờ duyệt");
        }

        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new RuntimeException("Admin không tồn tại"));

        verification.setVerificationStatus(VerificationStatus.REJECTED);
        verification.setRejectionReason(reason);
        verification.setAdmin(admin);
        verificationRepository.save(verification);

        // Optionally, update employer status to REJECTED if needed
        Employer employer = employerRepository.findByUserId(verification.getUser().getId().intValue())
                .orElse(null);
        if (employer != null) {
            employer.setStatus(EmployerStatus.SUSPENDED);
            employerRepository.save(employer);
        }
    }
}
