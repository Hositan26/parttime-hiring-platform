package tanhs.fudn.parttime_hiring_plaform_project.service.impl.employer;

import tanhs.fudn.parttime_hiring_plaform_project.service.employer.EmployerVerificationService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.CloudinaryResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.user.VerifyBusinessRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.EmployerVerificationStatusResponse;
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
import tanhs.fudn.parttime_hiring_plaform_project.util.ImageUploads;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmployerVerificationServiceImpl implements EmployerVerificationService {

    EmployerVerificationRepository verificationRepository;
    UserRepository userRepository;
    CloudinaryService cloudinaryService;
    UserEmailVerificationService emailVerificationService;
    EmployerVerificationMapper verificationMapper;

    private static final String FOLDER_NAME = "parttime_hiring/employer_verifications";

    // Consumes confirmed email proof before saving business verification documents.
    @Transactional(rollbackFor = IOException.class)
    public void submitVerification(VerifyBusinessRequest request, String username) throws IOException {
        User user = userRepository.lockByUsername(username)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

        if (verificationRepository.findByUserIdAndVerificationStatus(user.getId(), VerificationStatus.PENDING).isPresent()) {
            throw new BusinessException("A verification request is already pending");
        }
        ImageUploads.validate(request.getStoreFrontImage());
        ImageUploads.validate(request.getIdCardFront());
        ImageUploads.validate(request.getIdCardBack());
        if (request.getBusinessLicense() != null && !request.getBusinessLicense().isEmpty()) {
            ImageUploads.validate(request.getBusinessLicense());
        }
        emailVerificationService.verifyOtp(request.getEmail(), request.getOtpCode(), username);

        // Upload files
        CloudinaryResponse storeFrontRes = cloudinaryService.uploadFile(request.getStoreFrontImage(), FOLDER_NAME);
        CloudinaryResponse idFrontRes = cloudinaryService.uploadFile(request.getIdCardFront(), FOLDER_NAME);
        CloudinaryResponse idBackRes = cloudinaryService.uploadFile(request.getIdCardBack(), FOLDER_NAME);
        
        CloudinaryResponse licenseRes = null;
        if (request.getBusinessLicense() != null && !request.getBusinessLicense().isEmpty()) {
            licenseRes = cloudinaryService.uploadFile(request.getBusinessLicense(), FOLDER_NAME);
        }

        EmployerVerification verification = verificationMapper.create(request, user);
        verificationMapper.documents(storeFrontRes, idFrontRes, idBackRes, licenseRes, verification);

        verificationRepository.save(verification);
    }

    // Reads the authenticated applicant's latest verification decision.
    @Transactional(readOnly = true)
    public EmployerVerificationStatusResponse getMyVerificationStatus(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return verificationRepository.findFirstByUserIdOrderByVerificationIdDesc(user.getId())
                .map(verificationMapper::toEmployerVerificationStatusResponse)
                .orElse(null);
    }
}
