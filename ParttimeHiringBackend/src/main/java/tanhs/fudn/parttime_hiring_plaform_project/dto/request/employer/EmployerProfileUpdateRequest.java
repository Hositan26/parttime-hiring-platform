package tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployerProfileUpdateRequest {
    @Size(max = 255)
    private String businessType;
    @Size(max = 255)
    @Email
    private String emailContact;
    @Size(max = 255)
    private String phoneContact;
    @Size(max = 16000)
    private String description;
    @Size(max = 255)
    private String website;
    @Size(max = 255)
    private String representativeName;
}
