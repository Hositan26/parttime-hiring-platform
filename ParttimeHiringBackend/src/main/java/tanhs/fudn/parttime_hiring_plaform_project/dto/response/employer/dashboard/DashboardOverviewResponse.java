package tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardOverviewResponse {
    private long totalStores;
    private long totalJobs;
    private long totalApplications;
    private long pendingApplications;
    private String verificationStatus;
    private String verificationDate;
    private List<MonthlyStatResponse> monthlyStats;
    private List<RecentApplicationResponse> recentApplications;
    private List<ExpiringJobResponse> expiringJobs;
}
