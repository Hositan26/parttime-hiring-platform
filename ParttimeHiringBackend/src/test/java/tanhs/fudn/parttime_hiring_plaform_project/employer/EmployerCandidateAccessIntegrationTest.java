package tanhs.fudn.parttime_hiring_plaform_project.employer;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.ApplicationStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.CandidateProfileService;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class EmployerCandidateAccessIntegrationTest extends EmployerIntegrationFixture {
    @Autowired CandidateProfileService profiles;

    // Shares a CV only with the listing owner while the application is shared.
    @Test
    void revokesRecruiterAccessAfterWithdrawal() {
        var owner = business();
        var other = business();
        var candidate = account("candidate");
        var listing = job(store(owner, "Branch", true, true), "Hiring", JobStatus.ACTIVE,
                LocalDateTime.now().plusDays(2));
        var application = application(candidate, listing, ApplicationStatus.PENDING);
        byte[] cv = "%PDF-1.4\nTest CV\n%%EOF".getBytes(StandardCharsets.US_ASCII);
        profiles.upload(candidate.getUsername(), new MockMultipartFile("file", "cv.pdf", "application/pdf", cv));

        assertThat(profiles.applicationProfile(owner.username(), application.getApplicationId()).isHasResume()).isTrue();
        assertThat(profiles.applicationResume(owner.username(), application.getApplicationId())).isEqualTo(cv);
        assertThatThrownBy(() -> profiles.applicationProfile(other.username(), application.getApplicationId()))
                .isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> profiles.applicationResume(other.username(), application.getApplicationId()))
                .isInstanceOf(AccessDeniedException.class);

        application.setStatus(ApplicationStatus.WITHDRAWN);
        database.flush();
        assertThatThrownBy(() -> profiles.applicationProfile(owner.username(), application.getApplicationId()))
                .isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> profiles.applicationResume(owner.username(), application.getApplicationId()))
                .isInstanceOf(AccessDeniedException.class);
        assertThat(profiles.applicationResume(candidate.getUsername(), application.getApplicationId())).isEqualTo(cv);
    }
}
