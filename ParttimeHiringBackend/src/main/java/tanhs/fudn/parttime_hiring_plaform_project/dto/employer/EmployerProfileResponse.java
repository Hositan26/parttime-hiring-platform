package tanhs.fudn.parttime_hiring_plaform_project.dto.employer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmployerStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployerProfileResponse {
    private Integer employerId;
    private String companyName;
    private String businessType;
    private String emailContact;
    private String phoneContact;
    private String description;
    private String website;
    private String taxCode;
    private String representativeName;
    private EmployerStatus status;
    private String createdAt;
    
    // Verification documents
    private String storeFrontImageUrl;
    private String businessLicenseUrl;
    private String websiteFanpageUrl;
    private String idCardFrontUrl;
    private String idCardBackUrl;
    private String verificationStatus;
}
