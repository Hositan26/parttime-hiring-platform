package tanhs.fudn.parttime_hiring_plaform_project.dto.request.user;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CandidateProfileRequest {
    @Size(max = 2000)
    private String summary;
    @Size(max = 2000)
    private String skills;
    @Size(max = 5000)
    private String experience;
}
