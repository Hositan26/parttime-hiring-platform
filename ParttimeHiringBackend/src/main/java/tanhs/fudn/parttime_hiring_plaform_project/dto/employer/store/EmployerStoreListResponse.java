package tanhs.fudn.parttime_hiring_plaform_project.dto.employer.store;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployerStoreListResponse {
    private long totalStores;
    private long activeStores;
    private long inactiveStores;
    private List<EmployerStoreResponse> stores;
}
