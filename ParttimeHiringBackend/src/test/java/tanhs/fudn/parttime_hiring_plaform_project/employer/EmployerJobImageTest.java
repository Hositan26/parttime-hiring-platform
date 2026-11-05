package tanhs.fudn.parttime_hiring_plaform_project.employer;

import java.security.Principal;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import tanhs.fudn.parttime_hiring_plaform_project.controller.employer.EmployerJobController;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.service.common.CloudinaryService;
import tanhs.fudn.parttime_hiring_plaform_project.service.employer.EmployerJobService;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class EmployerJobImageTest {
    // Rejects foreign jobs and invalid image contents before invoking external storage.
    @Test
    void guardsJobImageUploads() {
        var jobs = mock(EmployerJobService.class);
        var cloudinary = mock(CloudinaryService.class);
        var controller = new EmployerJobController(jobs, cloudinary);
        Principal owner = () -> "owner";
        var invalid = new MockMultipartFile("file", "fake.png", "image/png", new byte[]{1, 2});
        when(jobs.getEmployerJobDetail("owner", 2)).thenThrow(new AccessDeniedException("foreign job"));

        assertThrows(AccessDeniedException.class, () -> controller.addJobImage(owner, 2, invalid));
        assertThrows(BusinessException.class, () -> controller.addJobImage(owner, 1, invalid));
        verifyNoInteractions(cloudinary);
        verify(jobs, never()).addJobImage(anyString(), anyInt(), anyString());
    }
}
