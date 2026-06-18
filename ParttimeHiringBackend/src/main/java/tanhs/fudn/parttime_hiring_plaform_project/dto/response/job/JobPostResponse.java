package tanhs.fudn.parttime_hiring_plaform_project.dto.response.job;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class JobPostResponse {
    private Integer id;
    private String title;
    private String store;
    private String location;
    private String salary;
    private List<String> shifts;
    private Integer headcount;
    private String date;
}
