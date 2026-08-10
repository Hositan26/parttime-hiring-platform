package tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.employer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmployerStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminEmployerResponse {
    private Integer employerId;
    private String companyName;
    private String representativeName;
    private String emailContact;
    private String phoneContact;
    private String website;
    private EmployerStatus status;
    private Long userId;
    private String username;
    private Boolean isActive;
}
