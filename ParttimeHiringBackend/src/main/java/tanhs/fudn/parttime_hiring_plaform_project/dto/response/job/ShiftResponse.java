package tanhs.fudn.parttime_hiring_plaform_project.dto.response.job;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import java.time.LocalTime;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShiftResponse {
    Integer id;
    String name;
    LocalTime startTime;
    LocalTime endTime;
}
