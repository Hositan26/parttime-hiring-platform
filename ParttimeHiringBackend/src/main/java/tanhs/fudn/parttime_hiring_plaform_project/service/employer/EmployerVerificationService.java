package tanhs.fudn.parttime_hiring_plaform_project.service.employer;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.dto.common.CloudinaryResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.user.VerifyBusinessRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.user.EmployerVerificationStatusResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.EmployerVerification;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.VerificationStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.EmployerVerificationMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerVerificationRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.common.CloudinaryService;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.UserEmailVerificationService;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmployerVerificationService {

    EmployerVerificationRepository verificationRepository;
    UserRepository userRepository;
    CloudinaryService cloudinaryService;
    UserEmailVerificationService emailVerificationService;
    EmployerVerificationMapper verificationMapper;

    private static final String FOLDER_NAME = "parttime_hiring/employer_verifications";

    @Transactional
    public void submitVerification(VerifyBusinessRequest request, String username) throws IOException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        // Validate OTP first
        emailVerificationService.verifyOtp(request.getEmail(), request.getOtpCode());

        // Kiểm tra xem đã có đơn PENDING nào chưa
        if (verificationRepository.findByUserIdAndVerificationStatus(user.getId(), VerificationStatus.PENDING).isPresent()) {
            throw new RuntimeException("Bạn đã có một đơn xác minh đang chờ duyệt.");
        }

        // Upload files
        CloudinaryResponse storeFrontRes = cloudinaryService.uploadFile(request.getStoreFrontImage(), FOLDER_NAME);
        CloudinaryResponse idFrontRes = cloudinaryService.uploadFile(request.getIdCardFront(), FOLDER_NAME);
        CloudinaryResponse idBackRes = cloudinaryService.uploadFile(request.getIdCardBack(), FOLDER_NAME);
        
        CloudinaryResponse licenseRes = null;
        if (request.getBusinessLicense() != null && !request.getBusinessLicense().isEmpty()) {
            licenseRes = cloudinaryService.uploadFile(request.getBusinessLicense(), FOLDER_NAME);
        }

        // Build entity
        EmployerVerification verification = EmployerVerification.builder()
                .user(user)
                .companyName(request.getStoreName())
                .representativeName(request.getRepresentativeName())
                .contactEmail(request.getEmail())
                .phoneContact(request.getPhone())
                .address(request.getAddress())
                .taxCode(request.getTaxCode())
                .websiteFanpageUrl(request.getWebsiteFanpageUrl())
                
                // URLs
                .storeFrontImageUrl(storeFrontRes.getUrl())
                .idCardFrontUrl(idFrontRes.getUrl())
                .idCardBackUrl(idBackRes.getUrl())
                .businessLicenseUrl(licenseRes != null ? licenseRes.getUrl() : null)
                
                // Public IDs
                .storeFrontImagePublicId(storeFrontRes.getPublicId())
                .idCardFrontPublicId(idFrontRes.getPublicId())
                .idCardBackPublicId(idBackRes.getPublicId())
                .businessLicensePublicId(licenseRes != null ? licenseRes.getPublicId() : null)
                
                .verificationStatus(VerificationStatus.PENDING)
                .build();

        verificationRepository.save(verification);
    }

    public EmployerVerificationStatusResponse getMyVerificationStatus(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return verificationRepository.findFirstByUserIdOrderByVerificationIdDesc(user.getId())
                .map(verificationMapper::toEmployerVerificationStatusResponse)
                .orElse(null);
    }
}
