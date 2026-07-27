package tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CategoryResponse {
    private Integer categoryId;
    private String categoryName;
    private String description;
    private String slug;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
