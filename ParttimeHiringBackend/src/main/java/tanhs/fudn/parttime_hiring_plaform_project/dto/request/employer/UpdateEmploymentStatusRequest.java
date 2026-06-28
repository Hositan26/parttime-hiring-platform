package tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.WorkStatus;

@Data
public class UpdateEmploymentStatusRequest {
    @NotNull(message = "Trạng thái không được để trống")
    private WorkStatus status;
    
    private String note;
}
