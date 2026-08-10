package tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.store;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStoreResponse {
    private Integer storeId;
    private String storeName;
    private String phoneContact;
    private String address; // city + district + ward + street
    private Boolean isActive;
    private LocalDateTime createdAt;
    
    // Employer Info
    private Integer employerId;
    private String companyName;
}
