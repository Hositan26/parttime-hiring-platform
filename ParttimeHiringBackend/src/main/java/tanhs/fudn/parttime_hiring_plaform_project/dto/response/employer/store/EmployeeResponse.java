package tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.store;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.WorkStatus;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {
    private Integer employmentId;
    
    // User info
    private Integer userId;
    private String displayName;
    private String email;
    private String avatarUrl;
    
    // Job info
    private String jobTitle;
    private WorkStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
}
