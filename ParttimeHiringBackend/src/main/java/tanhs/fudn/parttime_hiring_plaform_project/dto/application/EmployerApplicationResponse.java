package tanhs.fudn.parttime_hiring_plaform_project.dto.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployerApplicationResponse {
    private Integer applicationId;
    private Integer applicantId;
    private String applicantName;
    private String applicantEmail;
    private String applicantPhone;
    private String applicantAvatar;
    private String jobTitle;
    private Integer jobPostId;
    private String storeName;
    private String storeAddress;
    private String appliedDate;
    private String appliedTime;
    private String status;
    private String note;
}
