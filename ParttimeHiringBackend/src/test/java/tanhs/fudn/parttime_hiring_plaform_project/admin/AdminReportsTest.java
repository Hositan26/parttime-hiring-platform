package tanhs.fudn.parttime_hiring_plaform_project.admin;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import tanhs.fudn.parttime_hiring_plaform_project.repository.application.RecruitmentInteractionRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.application.JobApplicationRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.impl.user.RecruitmentInteractionServiceImpl;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.RecruitmentInteractionMapper;
import tanhs.fudn.parttime_hiring_plaform_project.service.user.UserNotificationService;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.InteractionKind;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.InteractionStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.application.RecruitmentInteraction;
import java.util.Optional;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class AdminReportsTest {
    // Filters open complaints and resolves them without deleting their text.
    @Test
    void filtersAndResolvesOnlyReports() {
        var repository = mock(RecruitmentInteractionRepository.class);
        when(repository.findByKindAndStatus(eq(InteractionKind.REPORT), eq(InteractionStatus.OPEN), any())).thenReturn(Page.empty());
        var service = new RecruitmentInteractionServiceImpl(mock(UserRepository.class), mock(JobPostRepository.class),
                mock(JobApplicationRepository.class), repository, mock(RecruitmentInteractionMapper.class), mock(UserNotificationService.class));
        assertTrue(service.adminReports(0, InteractionStatus.OPEN).isEmpty());
        var item = new RecruitmentInteraction(); item.setKind(InteractionKind.REPORT); item.setStatus(InteractionStatus.OPEN); item.setBody("Original complaint");
        when(repository.lockById(1L)).thenReturn(Optional.of(item));
        service.resolveReport(1L);
        assertEquals(InteractionStatus.RESOLVED, item.getStatus());
        assertEquals("Original complaint", item.getBody());
        verify(repository, never()).delete(any());
    }
}
