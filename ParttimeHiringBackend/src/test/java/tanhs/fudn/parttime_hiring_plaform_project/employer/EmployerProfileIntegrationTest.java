package tanhs.fudn.parttime_hiring_plaform_project.employer;

import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer.EmployerProfileUpdateRequest;
import tanhs.fudn.parttime_hiring_plaform_project.service.employer.EmployerProfileService;

import static org.assertj.core.api.Assertions.assertThat;

class EmployerProfileIntegrationTest extends EmployerIntegrationFixture {
    @Autowired EmployerProfileService profiles;
    @Autowired Validator validator;

    // Updates only the authenticated business and rejects invalid contact information.
    @Test
    void updatesOwnProfile() {
        var owner = business();
        var other = business();
        var request = EmployerProfileUpdateRequest.builder()
                .emailContact("recruiting@example.test").representativeName("Recruiter").build();

        assertThat(validator.validate(request)).isEmpty();
        profiles.updateEmployerProfile(owner.username(), request);
        database.flush();
        database.clear();

        var saved = profiles.getEmployerProfile(owner.username());
        assertThat(saved.getEmailContact()).isEqualTo("recruiting@example.test");
        assertThat(saved.getRepresentativeName()).isEqualTo("Recruiter");
        assertThat(profiles.getEmployerProfile(other.username()).getEmailContact()).isNull();
        request.setEmailContact("invalid-email");
        assertThat(validator.validate(request)).hasSize(1);
    }
}
