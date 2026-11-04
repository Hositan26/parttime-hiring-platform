package tanhs.fudn.parttime_hiring_plaform_project.dto.response.user;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class InteractionResponse {
    private Long id;
    private Long authorId;
    private Long recipientId;
    private String authorName;
    private Integer jobId;
    private String jobTitle;
    private String kind;
    private String status;
    private String body;
    private LocalDateTime meetingAt;
    private LocalDateTime createdAt;
}
