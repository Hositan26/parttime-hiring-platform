package tanhs.fudn.parttime_hiring_plaform_project.auth;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Store;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.EmploymentRecordMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.StoreRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employment.EmploymentRecordRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.impl.employment.EmployerEmploymentServiceImpl;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OwnershipUnitTest {
    // Rejects foreign store identifiers before reading employee information.
    @Test
    void blocksOtherEmployersStore() {
        var users = mock(UserRepository.class);
        var employers = mock(EmployerRepository.class);
        var stores = mock(StoreRepository.class);
        var records = mock(EmploymentRecordRepository.class);
        when(users.findByUsername("owner")).thenReturn(Optional.of(User.builder().id(1L).build()));
        when(employers.findByUserId(1)).thenReturn(Optional.of(Employer.builder().employerId(10).build()));
        when(stores.findById(99)).thenReturn(Optional.of(Store.builder()
                .employer(Employer.builder().employerId(20).build()).build()));
        var service = new EmployerEmploymentServiceImpl(records, employers, users,
                mock(EmploymentRecordMapper.class), stores);
        assertThrows(AccessDeniedException.class, () -> service.getEmploymentsByStore(99, "owner"));
        verifyNoInteractions(records);
    }
}
