package tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer.job;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddJobImageRequest {
    @NotBlank(message = "Image URL không được để trống")
    private String imageUrl;
}
