package tanhs.fudn.parttime_hiring_plaform_project.service.employer;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.dto.employer.EmployerProfileResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.employer.EmployerProfileUpdateRequest;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.EmployerVerification;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerVerificationRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EmployerProfileService {

    private final EmployerRepository employerRepository;
    private final UserRepository userRepository;
    private final EmployerVerificationRepository employerVerificationRepository;

    public EmployerProfileResponse getEmployerProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Employer employer = employerRepository.findByUserId(user.getId().intValue())
                .orElseThrow(() -> new RuntimeException("Employer profile not found"));

        Optional<EmployerVerification> verificationOpt = employerVerificationRepository.findFirstByUserIdOrderByVerificationIdDesc(user.getId());

        return mapToResponse(employer, verificationOpt.orElse(null));
    }

    @Transactional
    public EmployerProfileResponse updateEmployerProfile(String username, EmployerProfileUpdateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Employer employer = employerRepository.findByUserId(user.getId().intValue())
                .orElseThrow(() -> new RuntimeException("Employer profile not found"));

        if (request.getBusinessType() != null) employer.setBusinessType(request.getBusinessType());
        if (request.getEmailContact() != null) employer.setEmailContact(request.getEmailContact());
        if (request.getPhoneContact() != null) employer.setPhoneContact(request.getPhoneContact());
        if (request.getDescription() != null) employer.setDescription(request.getDescription());
        if (request.getWebsite() != null) employer.setWebsite(request.getWebsite());
        if (request.getRepresentativeName() != null) employer.setRepresentativeName(request.getRepresentativeName());

        employerRepository.save(employer);

        Optional<EmployerVerification> verificationOpt = employerVerificationRepository.findFirstByUserIdOrderByVerificationIdDesc(user.getId());

        return mapToResponse(employer, verificationOpt.orElse(null));
    }

    private EmployerProfileResponse mapToResponse(Employer employer, EmployerVerification verification) {
        EmployerProfileResponse.EmployerProfileResponseBuilder builder = EmployerProfileResponse.builder()
                .employerId(employer.getEmployerId())
                .companyName(employer.getCompanyName())
                .businessType(employer.getBusinessType())
                .emailContact(employer.getEmailContact())
                .phoneContact(employer.getPhoneContact())
                .description(employer.getDescription())
                .website(employer.getWebsite())
                .taxCode(employer.getTaxCode())
                .representativeName(employer.getRepresentativeName())
                .status(employer.getStatus())
                .createdAt(employer.getCreatedAt() != null ? employer.getCreatedAt().toString() : null);

        if (verification != null) {
            builder.storeFrontImageUrl(verification.getStoreFrontImageUrl())
                   .businessLicenseUrl(verification.getBusinessLicenseUrl())
                   .websiteFanpageUrl(verification.getWebsiteFanpageUrl())
                   .idCardFrontUrl(verification.getIdCardFrontUrl())
                   .idCardBackUrl(verification.getIdCardBackUrl())
                   .verificationStatus(verification.getVerificationStatus().name());
        }

        return builder.build();
    }
}
