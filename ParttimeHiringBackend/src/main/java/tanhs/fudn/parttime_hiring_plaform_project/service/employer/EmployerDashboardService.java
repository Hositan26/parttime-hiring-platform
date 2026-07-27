package tanhs.fudn.parttime_hiring_plaform_project.service.employer;

import tanhs.fudn.parttime_hiring_plaform_project.service.employer.EmployerDashboardService;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.dashboard.*;

public interface EmployerDashboardService {
    DashboardOverviewResponse getDashboardOverview(String username);
}