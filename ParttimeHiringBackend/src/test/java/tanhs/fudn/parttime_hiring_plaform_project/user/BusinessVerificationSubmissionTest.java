package tanhs.fudn.parttime_hiring_plaform_project.user;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Optional;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.springframework.mock.web.MockMultipartFile;
import org.mockito.ArgumentCaptor;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.user.VerifyBusinessRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.CloudinaryResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.EmployerVerification;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.VerificationStatus;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.EmployerVerificationMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerVerificationRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.UserEmailVerificationService;
import tanhs.fudn.parttime_hiring_plaform_project.service.common.CloudinaryService;
import tanhs.fudn.parttime_hiring_plaform_project.service.impl.employer.EmployerVerificationServiceImpl;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BusinessVerificationSubmissionTest {
    // Rejects spoofed documents before consuming email proof or uploading files.
    @Test
    void rejectsInvalidDocuments() {
        var users = mock(UserRepository.class); var storage = mock(CloudinaryService.class);
        var otp = mock(UserEmailVerificationService.class); var repository = mock(EmployerVerificationRepository.class);
        when(users.lockByUsername("candidate")).thenReturn(Optional.of(User.builder().id(1L).build()));
        var service = new EmployerVerificationServiceImpl(repository, users, storage, otp, Mappers.getMapper(EmployerVerificationMapper.class));
        VerifyBusinessRequest request = new VerifyBusinessRequest();
        request.setStoreFrontImage(new MockMultipartFile("file", "document.png", "image/png", "fake".getBytes()));
        assertThrows(BusinessException.class, () -> service.submitVerification(request, "candidate"));
        verifyNoInteractions(storage, otp);
    }

    // Persists a pending owner-bound application after validated uploads and confirmed email.
    @Test
    void submitsValidatedDocuments() throws Exception {
        var users = mock(UserRepository.class); var storage = mock(CloudinaryService.class);
        var otp = mock(UserEmailVerificationService.class); var repository = mock(EmployerVerificationRepository.class);
        when(users.lockByUsername("candidate")).thenReturn(Optional.of(User.builder().id(1L).build()));
        when(storage.uploadFile(any(), anyString())).thenReturn(CloudinaryResponse.builder().url("https://example.invalid/document.png").publicId("fixture").build());
        var service = new EmployerVerificationServiceImpl(repository, users, storage, otp, Mappers.getMapper(EmployerVerificationMapper.class));
        ByteArrayOutputStream bytes = new ByteArrayOutputStream(); ImageIO.write(new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB), "png", bytes);
        var file = new MockMultipartFile("file", "document.png", "image/png", bytes.toByteArray());
        VerifyBusinessRequest request = new VerifyBusinessRequest(); request.setStoreName("Business"); request.setEmail("business@example.invalid");
        request.setOtpCode("123456"); request.setStoreFrontImage(file); request.setIdCardFront(file); request.setIdCardBack(file);
        service.submitVerification(request, "candidate");
        var captor = ArgumentCaptor.forClass(EmployerVerification.class); verify(repository).save(captor.capture());
        assertEquals(1L, captor.getValue().getUser().getId());
        assertEquals(VerificationStatus.PENDING, captor.getValue().getVerificationStatus());
        assertEquals("https://example.invalid/document.png", captor.getValue().getIdCardFrontUrl());
        verify(otp).verifyOtp("business@example.invalid", "123456", "candidate");
    }
}
