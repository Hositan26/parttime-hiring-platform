package tanhs.fudn.parttime_hiring_plaform_project.dto.request.auth;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
@Data
public class ResetPasswordRequest {
    @NotBlank @Size(max = 100)
    private String token;
    @NotBlank @Size(min = 8, max = 72)
    private String password;
}
