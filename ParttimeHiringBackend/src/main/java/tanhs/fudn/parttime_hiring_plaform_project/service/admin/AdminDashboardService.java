package tanhs.fudn.parttime_hiring_plaform_project.service.admin;

import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminDashboardService;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.admin.dashboard.AdminDashboardStats;

public interface AdminDashboardService {
    AdminDashboardStats getStats();
}