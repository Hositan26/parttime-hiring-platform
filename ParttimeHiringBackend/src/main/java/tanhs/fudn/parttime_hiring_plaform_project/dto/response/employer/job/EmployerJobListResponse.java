package tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.job;

import lombok.Builder;
import lombok.Data;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmploymentType;

@Data
@Builder
public class EmployerJobListResponse {
    private Integer id;
    private String title;
    private String store;
    private String address;
    private String logo;
    private String salary;
    private EmploymentType type;
    private String shift;
    private Integer applicants;
    private JobStatus status;
    private String posted;
    private String deadline;
    private String daysLeft;
    private java.util.List<String> shiftsList;
    private java.util.List<String> categoriesList;
}
