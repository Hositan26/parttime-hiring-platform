package tanhs.fudn.parttime_hiring_plaform_project.admin;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.test.context.support.WithMockUser;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Store;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.entity.application.JobApplication;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.ApplicationStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.GenderRequirement;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmploymentType;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobCategoryRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.WorkShiftRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminStoreService;
import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminJobPostService;
import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminDashboardService;
import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminCategoryService;
import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminShiftService;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.admin.CategoryRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.admin.ShiftRequest;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest @ActiveProfiles("test") @Transactional @WithMockUser(username = "admin", roles = "ADMIN")
class AdminWorkflowIntegrationTest {
    @Autowired EntityManager database;
    @Autowired UserRepository users;
    @Autowired EmployerRepository employers;
    @Autowired JobCategoryRepository categories;
    @Autowired WorkShiftRepository shifts;
    @Autowired AdminStoreService stores;
    @Autowired AdminJobPostService jobs;
    @Autowired AdminDashboardService dashboard;
    @Autowired AdminCategoryService catalog;
    @Autowired AdminShiftService shiftCatalog;

    // Executes moderation queries and preserves referenced history across administrative actions.
    @Test
    void moderatesStoresJobsAndReferencedCatalogs() {
        var account = users.findByUsername("employer").orElseThrow();
        var employer = employers.findByUserId(account.getId().intValue()).orElseThrow();
        var store = Store.builder().employer(employer).storeName("Workflow Store").city("Test City")
                .isActive(false).isApproved(false).build();
        database.persist(store); database.flush();
        assertEquals(1, stores.getAllStores(0, 1, false, "WORKFLOW", false).getTotalElements());
        stores.updateStoreApproval(store.getStoreId(), true);
        assertFalse(store.getIsActive());
        stores.updateStoreStatus(store.getStoreId(), true);
        var categoryRequest = new CategoryRequest(); categoryRequest.setCategoryName("Workflow Category");
        var category = catalog.createCategory(categoryRequest);
        var shiftRequest = new ShiftRequest(); shiftRequest.setShiftName("Workflow Night");
        shiftRequest.setStartTime(LocalTime.of(22, 0)); shiftRequest.setEndTime(LocalTime.of(6, 0));
        var shift = shiftCatalog.createShift(shiftRequest);
        var job = JobPost.builder().employer(employer).store(store).title("Workflow Job").jobDescription("Details")
                .hourlyWageMin(BigDecimal.valueOf(25000)).currency("VND").vacancyCount(1)
                .genderRequirement(GenderRequirement.values()[0]).employmentType(EmploymentType.values()[0])
                .expiredAt(LocalDateTime.now().plusDays(2)).status(JobStatus.ACTIVE)
                .categories(List.of(categories.findById(category.getCategoryId()).orElseThrow()))
                .shifts(List.of(shifts.findById(shift.getShiftId()).orElseThrow())).build();
        database.persist(job); database.flush();
        assertEquals(1, jobs.getAllJobPosts(0, 1, JobStatus.ACTIVE, "WORKFLOW").getTotalElements());
        assertEquals(1, catalog.getCategories(0, 1, "WORKFLOW").getTotalElements());
        assertEquals(1, shiftCatalog.getShifts(0, 1, "WORKFLOW").getTotalElements());
        var application = JobApplication.builder().applicant(account).jobPost(job).status(ApplicationStatus.PENDING).build();
        database.persist(application); database.flush();
        assertTrue(dashboard.getStats().getTotalApplications() >= 1);
        assertThrows(BusinessException.class, () -> stores.deleteStore(store.getStoreId()));
        assertThrows(BusinessException.class, () -> jobs.deleteJobPost(job.getJobPostId()));
        assertThrows(BusinessException.class, () -> catalog.deleteCategory(category.getCategoryId()));
        assertThrows(BusinessException.class, () -> shiftCatalog.deleteShift(shift.getShiftId()));
        jobs.updateJobPostStatus(job.getJobPostId(), JobStatus.PAUSED);
        assertTrue(job.getModerationBlocked());
        jobs.updateJobPostStatus(job.getJobPostId(), JobStatus.ACTIVE);
        assertFalse(job.getModerationBlocked());
        assertEquals(ApplicationStatus.PENDING, application.getStatus());
        assertTrue(database.contains(application));
    }
}
