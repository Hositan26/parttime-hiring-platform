package tanhs.fudn.parttime_hiring_plaform_project.employer;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Store;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.entity.application.JobApplication;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmployerStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.ApplicationStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.GenderRequirement;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmploymentType;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
abstract class EmployerIntegrationFixture {
    @Autowired EntityManager database;

    record Account(User user, Employer employer) {
        // Returns the account name used by authenticated employer services.
        String username() { return user.getUsername(); }
    }

    // Creates an account with a unique identifier for isolated repository tests.
    User account(String prefix) {
        User user = User.builder().username(prefix + UUID.randomUUID().toString().replace("-", ""))
                .displayName(prefix).isActive(true).build();
        database.persist(user);
        return user;
    }

    // Persists a recruiter and its active business profile.
    Account business() {
        User user = account("recruiter");
        Employer employer = Employer.builder().userId(user.getId().intValue())
                .companyName("Employer fixture").status(EmployerStatus.ACTIVE).build();
        database.persist(employer);
        return new Account(user, employer);
    }

    // Creates a store with explicitly configured approval and activity.
    Store store(Account owner, String name, boolean approved, boolean active) {
        Store store = Store.builder().employer(owner.employer()).storeName(name).city("Da Nang")
                .isApproved(approved).isActive(active).build();
        database.persist(store);
        return store;
    }

    // Persists a valid job with a configurable state and deadline.
    JobPost job(Store store, String title, JobStatus status, LocalDateTime deadline) {
        JobPost job = JobPost.builder().employer(store.getEmployer()).store(store).title(title)
                .jobDescription("Recruitment fixture").hourlyWageMin(BigDecimal.valueOf(25000))
                .currency("VND").vacancyCount(1).genderRequirement(GenderRequirement.values()[0])
                .employmentType(EmploymentType.values()[0]).status(status).expiredAt(deadline).build();
        database.persist(job);
        return job;
    }

    // Persists an application with its actual applicant, listing, and state.
    JobApplication application(User candidate, JobPost job, ApplicationStatus status) {
        var application = JobApplication.builder().applicant(candidate).jobPost(job)
                .contactPhone("0901234567").status(status).build();
        database.persist(application);
        return application;
    }
}
