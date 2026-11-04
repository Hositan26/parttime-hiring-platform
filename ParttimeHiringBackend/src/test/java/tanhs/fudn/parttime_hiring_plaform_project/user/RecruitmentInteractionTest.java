package tanhs.fudn.parttime_hiring_plaform_project.user;

import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.springframework.security.access.AccessDeniedException;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.user.InteractionRequest;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.application.JobApplication;
import tanhs.fudn.parttime_hiring_plaform_project.entity.application.RecruitmentInteraction;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.ApplicationStatus;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.InteractionKind;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.InteractionStatus;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.RecruitmentInteractionMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.job.JobPostRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.application.JobApplicationRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.application.RecruitmentInteractionRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.impl.user.RecruitmentInteractionServiceImpl;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RecruitmentInteractionTest {
    // Rejects outsiders, past appointments, and accepting one's own invitation.
    @Test
    void enforcesConversationAndInterviewBoundaries() {
        UserRepository users = mock(UserRepository.class);
        JobPostRepository jobs = mock(JobPostRepository.class);
        JobApplicationRepository applications = mock(JobApplicationRepository.class);
        RecruitmentInteractionRepository interactions = mock(RecruitmentInteractionRepository.class);
        var service = new RecruitmentInteractionServiceImpl(users, jobs, applications, interactions,
                Mappers.getMapper(RecruitmentInteractionMapper.class));
        User candidate = User.builder().id(1L).build(); User employer = User.builder().id(3L).build();
        JobApplication application = JobApplication.builder().applicationId(5).applicant(candidate).status(ApplicationStatus.PENDING)
                .jobPost(JobPost.builder().employer(Employer.builder().userId(3).build()).build()).build();
        when(applications.findById(5)).thenReturn(Optional.of(application));
        when(users.findByUsername("actor")).thenReturn(Optional.of(User.builder().id(2L).build()));
        assertThrows(AccessDeniedException.class, () -> service.conversation("actor", 5, 0));
        when(users.findByUsername("actor")).thenReturn(Optional.of(candidate));
        InteractionRequest request = new InteractionRequest(); request.setBody("Interview"); request.setMeetingAt(LocalDateTime.now().minusDays(1));
        assertThrows(BusinessException.class, () -> service.send("actor", 5, request, InteractionKind.INTERVIEW));
        RecruitmentInteraction item = new RecruitmentInteraction(); item.setApplication(application); item.setKind(InteractionKind.INTERVIEW);
        item.setAuthor(candidate); item.setRecipient(employer); item.setStatus(InteractionStatus.OPEN); item.setMeetingAt(LocalDateTime.now().plusDays(1));
        when(interactions.lockById(7L)).thenReturn(Optional.of(item)); when(interactions.save(item)).thenReturn(item);
        assertThrows(BusinessException.class, () -> service.respond("actor", 7L, InteractionStatus.ACCEPTED));
        when(users.findByUsername("actor")).thenReturn(Optional.of(employer));
        service.respond("actor", 7L, InteractionStatus.ACCEPTED);
        assertEquals(InteractionStatus.ACCEPTED, item.getStatus());
    }
}
