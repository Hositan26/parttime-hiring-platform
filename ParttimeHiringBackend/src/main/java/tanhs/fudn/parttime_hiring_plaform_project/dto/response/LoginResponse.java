package tanhs.fudn.parttime_hiring_plaform_project.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import java.util.Set;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LoginResponse {
    String username;
    Set<String> roles;
    String displayName;
    String avatarUrl;
}
