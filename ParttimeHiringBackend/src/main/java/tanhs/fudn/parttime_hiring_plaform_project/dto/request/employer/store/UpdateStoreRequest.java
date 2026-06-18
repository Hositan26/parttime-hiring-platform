package tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer.store;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateStoreRequest {
    private String name;
    private String phone;
    private String address;
    private String description;
}
