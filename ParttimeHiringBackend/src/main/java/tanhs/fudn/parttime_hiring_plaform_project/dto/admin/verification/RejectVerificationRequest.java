package tanhs.fudn.parttime_hiring_plaform_project.dto.admin.verification;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RejectVerificationRequest {
    @NotBlank(message = "Lý do từ chối không được để trống")
    private String reason;
}
