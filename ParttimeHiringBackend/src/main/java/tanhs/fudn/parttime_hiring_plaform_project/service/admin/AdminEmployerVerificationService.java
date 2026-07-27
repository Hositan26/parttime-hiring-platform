package tanhs.fudn.parttime_hiring_plaform_project.service.admin;

import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminEmployerVerificationService;
import org.springframework.data.domain.Page;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.verification.VerificationDetailResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.verification.VerificationListResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.VerificationStatus;

public interface AdminEmployerVerificationService {
    Page<VerificationListResponse> getVerifications(VerificationStatus status, int page, int size);
    VerificationDetailResponse getVerificationDetail(Integer id);
    void approveVerification(Integer id, String adminUsername);
    void rejectVerification(Integer id, String reason, String adminUsername);
}