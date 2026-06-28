package tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.job;

import lombok.Builder;
import lombok.Data;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.ApplicationStatus;

@Data
@Builder
public class EmployerJobApplicantResponse {
    private Integer applicationId;
    private Integer userId;
    private String name;
    private String avatar;
    private String cvUrl;
    private String email;
    private String phone;
    private String appliedDate;
    private String appliedTime;
    private String note;
    private String jobTitle;
    private ApplicationStatus status;
}
