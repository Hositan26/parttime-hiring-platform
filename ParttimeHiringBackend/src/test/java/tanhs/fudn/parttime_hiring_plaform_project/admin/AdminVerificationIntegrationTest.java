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

    @Autowired tanhs.fudn.parttime_hiring_plaform_project.service.employer.EmployerVerificationService submissions;
    @org.springframework.test.context.bean.override.mockito.MockitoBean
    tanhs.fudn.parttime_hiring_plaform_project.service.common.CloudinaryService storage;
    @org.springframework.test.context.bean.override.mockito.MockitoBean
    tanhs.fudn.parttime_hiring_plaform_project.service.user.UserEmailVerificationService emailProof;

    // Submits documents, returns rejection notes, and grants employer access after resubmission.
    @Test
    void completesSubmissionDecisionAndApplicantResult() throws Exception {
        org.mockito.Mockito.when(storage.uploadFile(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.anyString()))
                .thenReturn(tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.CloudinaryResponse.builder()
                        .url("https://example.invalid/qa.png").publicId("qa-document").build());
        var bytes = new java.io.ByteArrayOutputStream();
        javax.imageio.ImageIO.write(new java.awt.image.BufferedImage(2, 2, java.awt.image.BufferedImage.TYPE_INT_RGB), "png", bytes);
        var file = new org.springframework.mock.web.MockMultipartFile("file", "qa.png", "image/png", bytes.toByteArray());
        var request = new tanhs.fudn.parttime_hiring_plaform_project.dto.request.user.VerifyBusinessRequest();
        request.setStoreName("Submission Workflow"); request.setRepresentativeName("QA Representative");
        request.setEmail("submission@example.invalid"); request.setPhone("0901234567"); request.setAddress("QA Address");
        request.setOtpCode("123456"); request.setStoreFrontImage(file); request.setIdCardFront(file); request.setIdCardBack(file);
        submissions.submitVerification(request, "admin");
        var first = verifications.findFirstByUserIdOrderByVerificationIdDesc(users.findByUsername("admin").orElseThrow().getId()).orElseThrow();
        service.rejectVerification(first.getVerificationId(), "Please upload readable documents", "admin");
        assertEquals("Please upload readable documents", submissions.getMyVerificationStatus("admin").getRejectionReason());
        submissions.submitVerification(request, "admin");
        var second = verifications.findFirstByUserIdOrderByVerificationIdDesc(users.findByUsername("admin").orElseThrow().getId()).orElseThrow();
        assertNotEquals(first.getVerificationId(), second.getVerificationId());
        service.approveVerification(second.getVerificationId(), "admin");
        assertEquals("APPROVED", submissions.getMyVerificationStatus("admin").getStatus());
        org.mockito.Mockito.verify(emailProof, org.mockito.Mockito.times(2)).verifyOtp("submission@example.invalid", "123456", "admin");
    }

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
