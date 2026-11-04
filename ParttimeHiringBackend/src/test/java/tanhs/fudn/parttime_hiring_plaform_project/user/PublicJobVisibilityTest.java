package tanhs.fudn.parttime_hiring_plaform_project.user;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Store;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmployerStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.GenderRequirement;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmploymentType;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostSpecification;
import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class PublicJobVisibilityTest {
    @Autowired EntityManager entityManager;
    @Autowired JobPostRepository jobs;

    // Hides unavailable jobs and businesses from public database searches.
    @Test
    void filtersPublicRecruitment() {
        Employer employer = Employer.builder().userId(777777).companyName("Visibility fixture")
                .status(EmployerStatus.ACTIVE).build();
        entityManager.persist(employer);
        Store store = Store.builder().employer(employer).storeName("Visibility store")
                .city("Test City").isActive(true).build();
        entityManager.persist(store);
        JobPost job = JobPost.builder().employer(employer).store(store).title("Visibility fixture job")
                .jobDescription("Test description").hourlyWageMin(BigDecimal.valueOf(25000))
                .currency("VND").vacancyCount(1).genderRequirement(GenderRequirement.values()[0])
                .employmentType(EmploymentType.values()[0]).status(JobStatus.ACTIVE).build();
        entityManager.persist(job);
        assertEquals(1, matches());
        store.setIsActive(false);
        assertEquals(0, matches());
        store.setIsActive(true);
        job.setExpiredAt(LocalDateTime.now().minusSeconds(1));
        assertEquals(0, matches());
        job.setExpiredAt(null);
        job.setPublishedAt(LocalDateTime.now().plusDays(1));
        assertEquals(0, matches());
    }

    // Runs the same visibility specification used by list and search endpoints.
    private long matches() {
        entityManager.flush();
        return jobs.count(JobPostSpecification.filterJobs("Visibility fixture job", null, null, null,
                null, null, null, null, null, null));
    }
}
