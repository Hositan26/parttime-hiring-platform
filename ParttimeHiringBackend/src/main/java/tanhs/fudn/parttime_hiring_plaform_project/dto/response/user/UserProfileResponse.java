package tanhs.fudn.parttime_hiring_plaform_project.dto.response.user;

import lombok.Data;
import java.util.List;

@Data
public class UserProfileResponse {
    private Integer userId;
    private String username;
    private String displayName;
    private String email;
    private String avatarUrl;
    private String dateOfBirth;
    private Boolean hasPassword;
    private List<String> roles;
}
