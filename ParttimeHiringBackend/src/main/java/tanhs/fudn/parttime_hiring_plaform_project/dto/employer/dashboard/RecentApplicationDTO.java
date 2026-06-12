package tanhs.fudn.parttime_hiring_plaform_project.dto.employer.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentApplicationDTO {
    private String name;
    private String role;
    private String store;
    private String time;
    private String status;
    private boolean isPending;
    private String img;
}
