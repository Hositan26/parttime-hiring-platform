package tanhs.fudn.parttime_hiring_plaform_project.dto.employer.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpiringJobDTO {
    private String name;
    private String store;
    private String expire;
    private String logo;
}
