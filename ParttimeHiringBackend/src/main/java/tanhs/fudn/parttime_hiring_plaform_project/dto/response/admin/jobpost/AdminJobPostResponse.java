package tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.jobpost;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmploymentType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminJobPostResponse {
    private Integer jobId;
    private String title;
    private EmploymentType employmentType;
    private BigDecimal hourlyWageMin;
    private BigDecimal hourlyWageMax;
    private Integer vacancyCount;
    private JobStatus status;
    private LocalDateTime expiredAt;
    private LocalDateTime createdAt;
    
    // Employer Info
    private Integer employerId;
    private String companyName;
}
