package tanhs.fudn.parttime_hiring_plaform_project.dto.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CloudinaryResponse {
    private String url;
    private String publicId;
}
