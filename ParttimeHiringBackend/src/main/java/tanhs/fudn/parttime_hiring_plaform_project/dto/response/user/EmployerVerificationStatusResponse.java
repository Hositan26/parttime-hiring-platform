package tanhs.fudn.parttime_hiring_plaform_project.dto.response.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployerVerificationStatusResponse {
    private String status;
    private LocalDateTime submittedAt;
    private String rejectionReason;
}
