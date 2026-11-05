package tanhs.fudn.parttime_hiring_plaform_project.employer;

import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer.UpdateEmploymentStatusRequest;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Store;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employment.EmploymentRecord;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.WorkStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.EmploymentRecordMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.StoreRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employment.EmploymentRecordRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.impl.employment.EmployerEmploymentServiceImpl;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmployerEmploymentTerminationTest {
    // Validates dates and reasons, then prevents overwriting a recorded termination.
    @Test
    void recordsTerminationExactlyOnce() {
        var records = mock(EmploymentRecordRepository.class);
        var employers = mock(EmployerRepository.class);
        var users = mock(UserRepository.class);
        var service = new EmployerEmploymentServiceImpl(records, employers, users,
                mock(EmploymentRecordMapper.class), mock(StoreRepository.class));
        var employer = Employer.builder().employerId(2).build();
        var record = EmploymentRecord.builder().store(Store.builder().employer(employer).build())
                .workStatus(WorkStatus.WORKING).startDate(LocalDate.now().plusDays(1)).build();
        when(records.lockById(3)).thenReturn(Optional.of(record));
        when(users.findByUsername("employer")).thenReturn(Optional.of(User.builder().id(1L).build()));
        when(employers.findByUserId(1)).thenReturn(Optional.of(employer));
        var request = new UpdateEmploymentStatusRequest();
        request.setStatus(WorkStatus.QUIT);
        request.setNote("  Resigned  ");
        assertThrows(BusinessException.class, () -> service.updateEmploymentStatus(3, request, "employer"));
        record.setStartDate(LocalDate.now().minusDays(1));
        request.setNote(" ");
        assertThrows(BusinessException.class, () -> service.updateEmploymentStatus(3, request, "employer"));
        request.setNote("  Resigned  ");
        service.updateEmploymentStatus(3, request, "employer");
        assertThrows(BusinessException.class, () -> service.updateEmploymentStatus(3, request, "employer"));
        assertEquals(WorkStatus.QUIT, record.getWorkStatus());
        assertEquals(LocalDate.now(), record.getEndDate());
        assertEquals("Resigned", record.getNote());
        verify(records).save(record);
    }
}
