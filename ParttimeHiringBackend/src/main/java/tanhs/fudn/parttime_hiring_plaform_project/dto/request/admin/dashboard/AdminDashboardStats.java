package tanhs.fudn.parttime_hiring_plaform_project.dto.request.admin.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStats {
    private long totalUsers;
    private long totalEmployers;
    private long totalJobs;
    private long totalApplications;
}
