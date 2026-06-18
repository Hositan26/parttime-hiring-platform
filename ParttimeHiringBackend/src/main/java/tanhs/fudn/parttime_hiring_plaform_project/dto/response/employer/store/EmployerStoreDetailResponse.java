package tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.store;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployerStoreDetailResponse {
    private Integer storeId;
    private String name;
    private String phone;
    private String address;
    private String description;
    private String status;
    private String logo;
    
    private List<StoreJobDTO> jobs;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StoreJobDTO {
        private Integer jobId;
        private String title;
        private String status;
        private long applications;
        private LocalDateTime expiredAt;
        private LocalDateTime createdAt;
    }
}
