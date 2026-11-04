package tanhs.fudn.parttime_hiring_plaform_project.dto.response.user;

import lombok.Data;

@Data
public class CandidateProfileResponse {
    private String displayName;
    private String summary;
    private String skills;
    private String experience;
    private boolean hasResume;
}
