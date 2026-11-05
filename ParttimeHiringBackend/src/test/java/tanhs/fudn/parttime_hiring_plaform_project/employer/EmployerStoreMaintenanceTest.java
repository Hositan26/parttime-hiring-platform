package tanhs.fudn.parttime_hiring_plaform_project.employer;

import java.util.Optional;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import javax.imageio.ImageIO;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import tanhs.fudn.parttime_hiring_plaform_project.service.common.CloudinaryService;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.CloudinaryResponse;
import org.junit.jupiter.api.Test;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer.store.UpdateStoreRequest;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Store;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.StoreMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.application.JobApplicationRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.StoreRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employment.EmploymentRecordRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.impl.employer.EmployerStoreServiceImpl;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmployerStoreMaintenanceTest {
    // Keeps approval for ordinary edits and requires review when the street changes.
    @Test
    void reviewsAddressChangesAndProtectsEmploymentHistory() {
        var users = mock(UserRepository.class);
        var employers = mock(EmployerRepository.class);
        var stores = mock(StoreRepository.class);
        var employment = mock(EmploymentRecordRepository.class);
        var service = new EmployerStoreServiceImpl(users, employers, stores, mock(JobPostRepository.class),
                mock(JobApplicationRepository.class), mock(StoreMapper.class), employment, mock(tanhs.fudn.parttime_hiring_plaform_project.service.common.CloudinaryService.class));
        Employer owner = Employer.builder().employerId(7).build();
        Store store = Store.builder().employer(owner).streetAddress("12 Main").isActive(true).isApproved(true).build();
        when(users.findByUsername("owner")).thenReturn(Optional.of(User.builder().id(1L).build()));
        when(employers.findByUserId(1)).thenReturn(Optional.of(owner));
        when(stores.lockById(2)).thenReturn(Optional.of(store));

        UpdateStoreRequest request = new UpdateStoreRequest();
        request.setName("New name");
        request.setAddress("12 Main");
        service.updateStore("owner", 2, request);
        assertTrue(store.getIsApproved());
        assertTrue(store.getIsActive());

        request.setAddress("14 Main");
        service.updateStore("owner", 2, request);
        assertFalse(store.getIsApproved());
        assertFalse(store.getIsActive());

        when(employment.existsByStore_StoreId(2)).thenReturn(true);
        assertThrows(BusinessException.class, () -> service.deleteStore("owner", 2));
        verify(stores, never()).delete(store);
        when(employment.existsByStore_StoreId(2)).thenReturn(false);
        service.deleteStore("owner", 2);
        verify(stores).delete(store);
    }

    // Checks ownership and file contents before replacing or removing a cover.
    @Test
    void managesOwnedStoreCover() throws Exception {
        var users = mock(UserRepository.class);
        var employers = mock(EmployerRepository.class);
        var stores = mock(StoreRepository.class);
        var storage = mock(CloudinaryService.class);
        var service = new EmployerStoreServiceImpl(users, employers, stores, mock(JobPostRepository.class),
                mock(JobApplicationRepository.class), mock(StoreMapper.class), mock(EmploymentRecordRepository.class), storage);
        Employer owner = Employer.builder().employerId(7).build();
        Store store = Store.builder().employer(Employer.builder().employerId(8).build()).build();
        when(users.findByUsername("owner")).thenReturn(Optional.of(User.builder().id(1L).build()));
        when(employers.findByUserId(1)).thenReturn(Optional.of(owner));
        when(stores.lockById(2)).thenReturn(Optional.of(store));
        var invalid = new MockMultipartFile("file", "fake.png", "image/png", new byte[]{1, 2});
        assertThrows(AccessDeniedException.class, () -> service.uploadCover("owner", 2, invalid));
        store.setEmployer(owner);
        assertThrows(BusinessException.class, () -> service.uploadCover("owner", 2, invalid));
        verifyNoInteractions(storage);

        var buffer = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB), "png", buffer);
        var image = new MockMultipartFile("file", "cover.png", "image/png", buffer.toByteArray());
        when(storage.uploadFile(image, "store_covers")).thenReturn(new CloudinaryResponse("https://example.test/cover.png", "fixture"));
        assertEquals("https://example.test/cover.png", service.uploadCover("owner", 2, image));
        assertEquals("https://example.test/cover.png", store.getCoverImageUrl());
        service.removeCover("owner", 2);
        assertNull(store.getCoverImageUrl());
    }
}
