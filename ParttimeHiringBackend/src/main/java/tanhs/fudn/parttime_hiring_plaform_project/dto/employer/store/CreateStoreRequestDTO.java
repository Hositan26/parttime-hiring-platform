package tanhs.fudn.parttime_hiring_plaform_project.dto.employer.store;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateStoreRequestDTO {
    private String name;
    private String phone;
    private String city;
    private String district;
    private String ward;
    private String streetAddress;
    private String description;
}
