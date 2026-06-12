package tanhs.fudn.parttime_hiring_plaform_project.dto.employer.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyStatDTO {
    private String name;
    private long uv;
}
