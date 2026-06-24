package tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.job;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EmployerJobImageResponse {
    private Integer imageId;
    private String imageUrl;
}
