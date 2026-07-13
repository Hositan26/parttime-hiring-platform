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
public class VerificationListResponse {
    private Integer verificationId;
    private Long userId;
    private String username;
    private String companyName;
    private String taxCode;
    private String submittedAt;
    private VerificationStatus status;
}
