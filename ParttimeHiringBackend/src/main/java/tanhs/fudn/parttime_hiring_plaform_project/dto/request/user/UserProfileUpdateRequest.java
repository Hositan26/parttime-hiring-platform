package tanhs.fudn.parttime_hiring_plaform_project.dto.request.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import lombok.Data;
import java.time.LocalDate;

@Data
public class UserProfileUpdateRequest {
    private String currentPassword;
    @Size(min = 1, max = 100)
    private String displayName;
    @Pattern(regexp = "[a-zA-Z0-9_]{3,50}")
    private String username;
    @Email
    @Size(max = 255)
    private String email;
    @PastOrPresent
    private LocalDate dateOfBirth;
}
