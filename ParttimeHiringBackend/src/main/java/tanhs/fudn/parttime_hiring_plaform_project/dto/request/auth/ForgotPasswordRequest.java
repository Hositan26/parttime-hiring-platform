package tanhs.fudn.parttime_hiring_plaform_project.dto.request.auth;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
@Data
public class ForgotPasswordRequest {
    @NotBlank @Email
    private String email;
}
