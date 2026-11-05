package tanhs.fudn.parttime_hiring_plaform_project.user;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.application.JobApplicationRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.user.CandidateProfileRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.user.InteractionRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.user.ReviewRequest;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Store;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.ApplicationStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmployerStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.GenderRequirement;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmploymentType;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.InteractionKind;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.InteractionStatus;
import tanhs.fudn.parttime_hiring_plaform_project.repository.application.JobApplicationRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.application.JobApplicationService;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.SavedJobService;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.CandidateProfileService;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.UserNotificationService;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.EmploymentHistoryService;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.UserReviewService;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.RecruitmentInteractionService;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest @ActiveProfiles("test") @Transactional
class UserJourneyIntegrationTest {
    @Autowired EntityManager database;
    @Autowired JobApplicationRepository applications;
    @Autowired JobApplicationService applicationService;
    @Autowired SavedJobService favorites;
    @Autowired CandidateProfileService profiles;
    @Autowired UserNotificationService notifications;
    @Autowired EmploymentHistoryService employment;
    @Autowired UserReviewService reviews;
    @Autowired RecruitmentInteractionService communication;

    // Persists the candidate journey across favorites, applications, hiring, reviews, and interviews.
    @Test
    void completesCandidateJourney() {
        User candidate = account("candidate"); User recruiter = account("recruiter");
        Employer employer = Employer.builder().userId(recruiter.getId().intValue()).companyName("Journey employer").status(EmployerStatus.ACTIVE).build();
        database.persist(employer);
        Store store = Store.builder().employer(employer).storeName("Journey store").city("Journey City").isActive(true).build();
        database.persist(store);
        JobPost job = JobPost.builder().employer(employer).store(store).title("Journey job").jobDescription("Description")
                .hourlyWageMin(BigDecimal.valueOf(25000)).currency("VND").vacancyCount(2)
                .genderRequirement(GenderRequirement.values()[0]).employmentType(EmploymentType.values()[0]).status(JobStatus.ACTIVE).build();
        database.persist(job); database.flush();
        String username = candidate.getUsername();
        favorites.save(username, job.getJobPostId()); favorites.save(username, job.getJobPostId());
        assertEquals(1, favorites.list(username, 0, 12).getTotalElements());
        CandidateProfileRequest profile = new CandidateProfileRequest(); profile.setSkills("Customer service");
        assertEquals("Customer service", profiles.update(username, profile).getSkills());
        applicationService.applyForJob(JobApplicationRequest.builder().jobPostId(job.getJobPostId()).contactPhone("0901234567").note("Available weekends").build(), username);
        var application = applications.findByApplicant_IdOrderByAppliedAtDesc(candidate.getId()).get(0);
        assertEquals("Customer service", profiles.applicationProfile(recruiter.getUsername(), application.getApplicationId()).getSkills());
        applicationService.updateApplicationStatus(application.getApplicationId(), ApplicationStatus.ACCEPTED, null, recruiter.getUsername());
        assertEquals(1, notifications.list(username, 0, 20).getTotalElements());
        var notification = notifications.list(username, 0, 20).getContent().get(0);
        notifications.read(username, notification.getId());
        assertNotNull(notifications.list(username, 0, 20).getContent().get(0).getReadAt());
        var history = employment.history(username, 0, 12);
        assertEquals(1, history.getTotalElements());
        ReviewRequest review = new ReviewRequest(); review.setRating(5); review.setComment("Helpful team");
        assertEquals(5, reviews.save(username, history.getContent().get(0).getId(), review).getRating());
        InteractionRequest invitation = new InteractionRequest(); invitation.setBody("Meet at the store"); invitation.setMeetingAt(LocalDateTime.now().plusDays(1));
        assertEquals(1, notifications.list(recruiter.getUsername(), 0, 20).getTotalElements());
        var interview = communication.send(username, application.getApplicationId(), invitation, InteractionKind.INTERVIEW);
        assertEquals(2, notifications.list(recruiter.getUsername(), 0, 20).getTotalElements());
        assertEquals(application.getApplicationId(), notifications.list(recruiter.getUsername(), 0, 20).getContent().get(0).getApplicationId());
        assertEquals("ACCEPTED", communication.respond(recruiter.getUsername(), interview.getId(), InteractionStatus.ACCEPTED).getStatus());
        assertEquals(1, communication.conversation(username, application.getApplicationId(), 0).getTotalElements());
        InteractionRequest report = new InteractionRequest(); report.setBody("Please verify the address");
        communication.report(username, job.getJobPostId(), report);
        assertEquals(1, communication.reports(username, 0).getTotalElements());
        database.flush();
    }

    // Creates isolated account fixtures with unique identifiers.
    private User account(String prefix) {
        User user = User.builder().username(prefix + UUID.randomUUID().toString().replace("-", ""))
                .displayName(prefix).isActive(true).build();
        database.persist(user);
        return user;
    }
}
