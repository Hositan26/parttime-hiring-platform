package tanhs.fudn.parttime_hiring_plaform_project.dto.request.auth;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
@Data
public class ChangePasswordRequest {
    @NotBlank @Size(max = 72)
    private String currentPassword;
    @NotBlank @Size(min = 8, max = 72)
    private String password;
}
