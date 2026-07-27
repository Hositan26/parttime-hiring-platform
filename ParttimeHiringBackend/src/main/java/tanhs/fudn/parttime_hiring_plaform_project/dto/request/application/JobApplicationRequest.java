package tanhs.fudn.parttime_hiring_plaform_project.dto.request.application;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationRequest {
    
    @NotNull(message = "Job post ID cannot be null")
    private Integer jobPostId;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String contactPhone;

    private String note;
}
