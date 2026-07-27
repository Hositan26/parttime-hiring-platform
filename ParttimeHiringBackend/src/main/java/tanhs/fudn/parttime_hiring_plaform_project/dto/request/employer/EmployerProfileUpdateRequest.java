package tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployerProfileUpdateRequest {
    private String businessType;
    private String emailContact;
    private String phoneContact;
    private String description;
    private String website;
    private String representativeName;
}
