package tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.job;

import lombok.Builder;
import lombok.Data;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmploymentType;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.GenderRequirement;

import java.util.List;

@Data
@Builder
public class EmployerJobDetailResponse {
    private Integer id;
    private String title;
    private String store;
    private Integer storeId;
    private String address;
    private String logo;
    private JobStatus status;
    private String salary;
    private EmploymentType type;
    private String shift;
    private Integer applicants;
    private Integer vacancyCount;
    private String deadline;
    private String rawExpiredAt;
    private String daysLeft;
    private String posted;
    
    private Integer minAge;
    private Integer maxAge;
    private GenderRequirement genderRequirement;
    
    private String description;
    private String requirements;
    private String benefits;
    
    private List<String> shiftsList;
    private List<Integer> shiftIds;
    private List<String> categoriesList;
    private List<Integer> categoryIds;
    private List<EmployerJobImageResponse> images;
}
