package tanhs.fudn.parttime_hiring_plaform_project.dto.employer.store;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployerStoreDTO {
    private Integer storeId;
    private String name;
    private String phone;
    private String address;
    private long jobs;
    private long applications;
    private String status;
    private String logo;
}
