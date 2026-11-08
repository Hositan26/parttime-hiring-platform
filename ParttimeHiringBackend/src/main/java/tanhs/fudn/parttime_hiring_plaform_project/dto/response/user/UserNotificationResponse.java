package tanhs.fudn.parttime_hiring_plaform_project.dto.response.user;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class UserNotificationResponse {
    private Long id;
    private Integer applicationId;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}
