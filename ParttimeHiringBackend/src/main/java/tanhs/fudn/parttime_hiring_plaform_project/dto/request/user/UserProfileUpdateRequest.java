package tanhs.fudn.parttime_hiring_plaform_project.dto.request.user;

import lombok.Data;
import java.time.LocalDate;

@Data
public class UserProfileUpdateRequest {
    private String currentPassword;
    private String displayName;
    private String username;
    private String email;
    private LocalDate dateOfBirth;
}
