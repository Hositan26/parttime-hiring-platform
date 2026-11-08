package tanhs.fudn.parttime_hiring_plaform_project.dto.request.application;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ApplicationUpdateRequest {
    @NotBlank
    @Pattern(regexp = "\\+?[0-9]{9,15}")
    private String contactPhone;
    @Size(max = 2000)
    private String note;
}
