package tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin;

import lombok.Data;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
public class ShiftResponse {
    private Integer shiftId;
    private String shiftName;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean isFlexible;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
