package tanhs.fudn.parttime_hiring_plaform_project.user;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.CandidateProfile;
import tanhs.fudn.parttime_hiring_plaform_project.entity.application.JobApplication;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.exception.BusinessException;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.CandidateProfileMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.CandidateProfileRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.application.JobApplicationRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.impl.user.CandidateProfileServiceImpl;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CandidateProfileTest {
    // Stores accepted PDF bytes privately and returns metadata without document content.
    @Test
    void storesPrivatePdfAttachment() {
        UserRepository users = mock(UserRepository.class);
        CandidateProfileRepository profiles = mock(CandidateProfileRepository.class);
        var service = new CandidateProfileServiceImpl(users, profiles, mock(JobApplicationRepository.class), Mappers.getMapper(CandidateProfileMapper.class));
        User user = User.builder().id(1L).displayName("Candidate").build();
        CandidateProfile profile = new CandidateProfile(); profile.setUser(user);
        when(users.lockByUsername("candidate")).thenReturn(Optional.of(user));
        when(users.findByUsername("candidate")).thenReturn(Optional.of(user));
        when(profiles.findByUser_Id(1L)).thenReturn(Optional.of(profile));
        when(profiles.save(profile)).thenReturn(profile);
        byte[] content = "%PDF-1.4\nfixture attachment\n%%EOF".getBytes(java.nio.charset.StandardCharsets.US_ASCII);
        var file = new MockMultipartFile("file", "resume.pdf", "application/pdf", content);
        assertTrue(service.upload("candidate", file).isHasResume());
        assertArrayEquals(content, service.resume("candidate"));
        assertEquals("resume.pdf", profile.getResumeFileName());
    }
    // Blocks malformed documents and unrelated employers before returning candidate data.
    @Test
    void protectsDocumentsAndApplicantPrivacy() {
        UserRepository users = mock(UserRepository.class);
        CandidateProfileRepository profiles = mock(CandidateProfileRepository.class);
        JobApplicationRepository applications = mock(JobApplicationRepository.class);
        var service = new CandidateProfileServiceImpl(users, profiles, applications, Mappers.getMapper(CandidateProfileMapper.class));
        User user = User.builder().id(1L).build();
        when(users.lockByUsername("candidate")).thenReturn(Optional.of(user));
        when(users.findByUsername("candidate")).thenReturn(Optional.of(user));
        when(profiles.findByUser_Id(1L)).thenReturn(Optional.empty());
        var fake = new MockMultipartFile("file", "cv.pdf", "application/pdf", "not a PDF".getBytes());
        assertThrows(BusinessException.class, () -> service.upload("candidate", fake));
        verify(profiles, never()).save(any());
        when(applications.findById(5)).thenReturn(Optional.of(JobApplication.builder()
                .applicant(User.builder().id(2L).build()).jobPost(JobPost.builder()
                        .employer(Employer.builder().userId(3).build()).build()).build()));
        assertThrows(AccessDeniedException.class, () -> service.applicationProfile("candidate", 5));
    }
}
