package tanhs.fudn.parttime_hiring_plaform_project.dto.request.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalTime;

@Data
public class ShiftRequest {
    @NotBlank(message = "Tên ca làm việc không được để trống")
    private String shiftName;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    private LocalTime startTime;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    private LocalTime endTime;

    private Boolean isFlexible;
}
