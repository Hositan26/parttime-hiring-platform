package tanhs.fudn.parttime_hiring_plaform_project.dto.admin.verification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.VerificationStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationDetailResponse {
    private Integer verificationId;
    private Long userId;
    private String username;
    private String email;
    private String contactEmail;
    private String phoneContact;
    private String address;
    private String companyName;
    private String representativeName;
    private String taxCode;
    private String websiteFanpageUrl;
    
    // Images
    private String storeFrontImageUrl;
    private String idCardFrontUrl;
    private String idCardBackUrl;
    private String businessLicenseUrl;
    
    private VerificationStatus status;
    private String submittedAt;
}
