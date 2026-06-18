package tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpiringJobResponse {
    private String name;
    private String store;
    private String expire;
    private String logo;
}
