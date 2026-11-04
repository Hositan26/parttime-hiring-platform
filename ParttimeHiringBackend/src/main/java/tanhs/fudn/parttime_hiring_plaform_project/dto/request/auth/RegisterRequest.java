package tanhs.fudn.parttime_hiring_plaform_project.dto.request.auth;

import tanhs.fudn.parttime_hiring_plaform_project.validator.Utf8Password;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    @Pattern(regexp = "[a-zA-Z0-9_]{3,50}", message = "Username must contain 3–50 letters, numbers or underscores")
    private String username;
    @NotBlank
    @Size(min = 8, max = 72)
    @Utf8Password
    private String password;
    @NotBlank
    @Size(max = 100)
    private String displayName;
    @Email
    @Size(max = 255)
    private String email;
    @Pattern(regexp = "^$|\\d{4}-\\d{2}-\\d{2}", message = "Use yyyy-MM-dd")
    private String dateOfBirth;
}
