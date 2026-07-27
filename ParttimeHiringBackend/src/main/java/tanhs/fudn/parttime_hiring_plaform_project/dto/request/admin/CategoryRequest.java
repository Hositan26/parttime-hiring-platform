package tanhs.fudn.parttime_hiring_plaform_project.dto.request.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank(message = "Tên danh mục không được để trống")
    private String categoryName;
    private String description;
    private Boolean isActive;
}
