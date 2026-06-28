package tanhs.fudn.parttime_hiring_plaform_project.dto.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationResponse {
    
    private Integer applicationId;
    private Integer jobPostId;
    private String jobTitle;
    private String companyName;
    private String storeFrontImageUrl;
    private String contactPhone;
    private String note;
    private String status;
    private String jobStatus;
    private LocalDateTime appliedAt;
}
