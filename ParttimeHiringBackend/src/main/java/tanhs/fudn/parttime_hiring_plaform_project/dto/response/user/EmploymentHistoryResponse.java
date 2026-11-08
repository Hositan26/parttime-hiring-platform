package tanhs.fudn.parttime_hiring_plaform_project.dto.response.user;

import java.time.LocalDate;
import lombok.Data;

@Data
public class EmploymentHistoryResponse {
    private Integer id;
    private String storeName;
    private String jobTitle;
    private LocalDate startDate;
    private LocalDate endDate;
    private String workStatus;
}
