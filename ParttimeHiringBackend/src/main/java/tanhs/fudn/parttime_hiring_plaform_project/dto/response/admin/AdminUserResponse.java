package tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin;

import lombok.Data;
import java.util.List;

@Data
public class AdminUserResponse {
    private Integer id;
    private String username;
    private String email;
    private String displayName;
    private Boolean isLocked;
    private List<String> roles;
}
