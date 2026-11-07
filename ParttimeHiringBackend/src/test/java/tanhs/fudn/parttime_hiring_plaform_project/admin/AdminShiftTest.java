package tanhs.fudn.parttime_hiring_plaform_project.admin;

import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import java.time.LocalTime;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.WorkShiftRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.WorkShiftMapper;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.admin.ShiftRequest;
import tanhs.fudn.parttime_hiring_plaform_project.service.impl.admin.AdminShiftServiceImpl;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class AdminShiftTest {
    // Accepts overnight intervals while rejecting empty intervals and dependent deletion.
    @Test
    void validatesOvernightIntervalsAndReferencedShifts() {
        var repository = mock(WorkShiftRepository.class);
        var jobs = mock(JobPostRepository.class);
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        var service = new AdminShiftServiceImpl(repository, Mappers.getMapper(WorkShiftMapper.class), jobs);
        var request = new ShiftRequest(); request.setShiftName("Night");
        request.setStartTime(LocalTime.of(22, 0)); request.setEndTime(LocalTime.of(6, 0));
        assertEquals(LocalTime.of(6, 0), service.createShift(request).getEndTime());
        request.setEndTime(request.getStartTime());
        assertThrows(IllegalArgumentException.class, () -> service.createShift(request));
        when(repository.existsById(3)).thenReturn(true);
        when(jobs.existsByShifts_ShiftId(3)).thenReturn(true);
        assertThrows(BusinessException.class, () -> service.deleteShift(3));
        verify(repository, never()).deleteById(3);
    }
}
