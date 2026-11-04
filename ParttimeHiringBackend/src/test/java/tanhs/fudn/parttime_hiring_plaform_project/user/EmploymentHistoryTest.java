package tanhs.fudn.parttime_hiring_plaform_project.user;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.EmploymentHistoryMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employment.EmploymentRecordRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.impl.user.EmploymentHistoryServiceImpl;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmploymentHistoryTest {
    // Queries only the current account and rejects oversized history requests.
    @Test
    void restrictsHistoryScopeAndPageSize() {
        UserRepository users = mock(UserRepository.class);
        EmploymentRecordRepository records = mock(EmploymentRecordRepository.class);
        EmploymentHistoryServiceImpl service = new EmploymentHistoryServiceImpl(users, records, mock(EmploymentHistoryMapper.class));
        when(users.findByUsername("candidate")).thenReturn(Optional.of(User.builder().id(1L).build()));
        when(records.findByUser_Id(eq(1L), any(Pageable.class))).thenReturn(Page.empty());
        assertTrue(service.history("candidate", 0, 12).isEmpty());
        verify(records).findByUser_Id(eq(1L), any(Pageable.class));
        verify(records, never()).findAll();
        assertThrows(BusinessException.class, () -> service.history("candidate", 0, 51));
    }
}
