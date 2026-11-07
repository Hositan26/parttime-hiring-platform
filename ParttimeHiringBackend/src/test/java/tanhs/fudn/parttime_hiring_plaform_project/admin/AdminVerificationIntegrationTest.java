package tanhs.fudn.parttime_hiring_plaform_project.admin;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.EmployerVerification;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.VerificationStatus;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerVerificationRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminEmployerVerificationService;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest @ActiveProfiles("test") @Transactional
class AdminVerificationIntegrationTest {
    @Autowired AdminEmployerVerificationService service;
    @Autowired EmployerVerificationRepository verifications;
    @Autowired UserRepository users;

    // Preserves rejection notes and refuses decisions on already reviewed applications.
    @Test
    void rejectionRequiresVisibleReasonAndCannotBeOverwritten() {
        var record = submission();
        assertThrows(tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException.class,
                () -> service.rejectVerification(record.getVerificationId(), "   ", "admin"));
        service.rejectVerification(record.getVerificationId(), "  Missing readable license  ", "admin");
        var rejected = verifications.findById(record.getVerificationId()).orElseThrow();
        assertEquals("Missing readable license", rejected.getRejectionReason());
        assertEquals(VerificationStatus.REJECTED, rejected.getVerificationStatus());
        assertThrows(tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException.class,
                () -> service.approveVerification(record.getVerificationId(), "admin"));
    }

    // Grants employer access atomically while retaining existing administrator privileges.
    @Test
    void approvalCreatesEmployerAndRetainsExistingRoles() {
        var record = submission();
        service.approveVerification(record.getVerificationId(), "admin");
        assertEquals(VerificationStatus.APPROVED, verifications.findById(record.getVerificationId()).orElseThrow().getVerificationStatus());
        var account = users.findByUsername("admin").orElseThrow();
        assertTrue(account.getRoles().stream().anyMatch(role -> role.getRoleName().equals("EMPLOYER")));
        assertTrue(account.getRoles().stream().anyMatch(role -> role.getRoleName().equals("ADMIN")));
    }

    // Finds business documents by company or tax code before pagination.
    @Test
    void searchesCompanyAndTaxCodeWithinStatus() {
        var record = submission();
        assertEquals(1, service.getVerifications(VerificationStatus.PENDING, 0, 1, "AUDIT COMPANY").getTotalElements());
        assertEquals(record.getVerificationId(), service.getVerifications(VerificationStatus.PENDING, 0, 10, "998877").getContent().get(0).getVerificationId());
        assertTrue(service.getVerifications(VerificationStatus.REJECTED, 0, 10, "998877").isEmpty());
        assertNull(service.getVerificationDetail(record.getVerificationId()).getBusinessLicenseUrl());
    }

    // Creates isolated document metadata without uploading or sending external messages.
    private EmployerVerification submission() {
        return verifications.saveAndFlush(EmployerVerification.builder()
                .user(users.findByUsername("admin").orElseThrow()).companyName("Audit Company")
                .taxCode("998877").contactEmail("review@example.invalid").phoneContact("0901234567")
                .address("Test address").representativeName("Representative")
                .idCardFrontUrl("https://example.invalid/front.png").idCardBackUrl("https://example.invalid/back.png")
                .storeFrontImageUrl("https://example.invalid/store.png").build());
    }
}
