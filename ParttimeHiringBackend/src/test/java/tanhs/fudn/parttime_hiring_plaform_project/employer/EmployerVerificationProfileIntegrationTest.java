package tanhs.fudn.parttime_hiring_plaform_project.employer;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.EmployerVerification;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.VerificationStatus;
import tanhs.fudn.parttime_hiring_plaform_project.service.employer.EmployerProfileService;

import static org.assertj.core.api.Assertions.assertThat;

class EmployerVerificationProfileIntegrationTest extends EmployerIntegrationFixture {
    @Autowired EmployerProfileService profiles;

    // Returns the latest documents belonging to the signed-in business.
    @Test
    void readsLatestOwnedVerification() {
        var owner = business();
        var other = business();
        verification(owner, "old");
        verification(owner, "latest");
        verification(other, "foreign");

        var profile = profiles.getEmployerProfile(owner.username());
        assertThat(profile.getVerificationStatus()).isEqualTo("PENDING");
        assertThat(profile.getStoreFrontImageUrl()).isEqualTo("https://example.test/latest/store.png");
        assertThat(profile.getBusinessLicenseUrl()).isEqualTo("https://example.test/latest/license.png");
        assertThat(profile.getIdCardFrontUrl()).isEqualTo("https://example.test/latest/front.png");
        assertThat(profile.getIdCardBackUrl()).isEqualTo("https://example.test/latest/back.png");
    }

    // Persists a verification with distinct document URLs.
    private void verification(Account owner, String folder) {
        String root = "https://example.test/" + folder;
        database.persist(EmployerVerification.builder().user(owner.user())
                .contactEmail("verification@example.test").phoneContact("0901234567")
                .address("Da Nang").companyName("Business").representativeName("Recruiter")
                .storeFrontImageUrl(root + "/store.png").businessLicenseUrl(root + "/license.png")
                .idCardFrontUrl(root + "/front.png").idCardBackUrl(root + "/back.png")
                .verificationStatus(VerificationStatus.PENDING).build());
    }
}
