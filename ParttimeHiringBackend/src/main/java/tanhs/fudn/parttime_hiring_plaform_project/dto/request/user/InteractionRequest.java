package tanhs.fudn.parttime_hiring_plaform_project.dto.request.user;

import java.time.LocalDateTime;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Future;
import lombok.Data;

@Data
public class InteractionRequest {
    @NotBlank @Size(max = 2000)
    private String body;
    @Future
    private LocalDateTime meetingAt;
}
