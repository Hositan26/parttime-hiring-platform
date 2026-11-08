package tanhs.fudn.parttime_hiring_plaform_project.auth;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import org.springframework.context.ApplicationEventPublisher;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.Role;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.EmployerVerification;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.EmployerVerificationMapper;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerVerificationRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.RoleRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.impl.admin.AdminEmployerVerificationServiceImpl;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class EmployerGrantUnitTest {
    // Creates the employer profile and preserves existing user privileges on approval.
    @Test
    void grantsEmployerToNewApplicant() {
        var applicant = User.builder().id(7L).roles(Set.of(new Role("USER", "User"))).build();
        var verification = EmployerVerification.builder().user(applicant).companyName("Example")
                .contactEmail("business@example.com").build();
        var verifications = mock(EmployerVerificationRepository.class);
        when(verifications.lockById(1)).thenReturn(Optional.of(verification));
        var users = mock(UserRepository.class);
        when(users.findByUsername("admin")).thenReturn(Optional.of(User.builder().id(1L).build()));
        var roles = mock(RoleRepository.class);
        when(roles.findById("EMPLOYER")).thenReturn(Optional.of(new Role("EMPLOYER", "Employer")));
        var employers = mock(EmployerRepository.class);
        var service = new AdminEmployerVerificationServiceImpl(verifications, employers, users, roles,
                Mappers.getMapper(EmployerVerificationMapper.class), mock(ApplicationEventPublisher.class));
        service.approveVerification(1, "admin");
        verify(employers).save(argThat(value -> value.getUserId() == 7));
        assertTrue(applicant.getRoles().stream().anyMatch(role -> role.getRoleName().equals("EMPLOYER")));
        assertTrue(applicant.getRoles().stream().anyMatch(role -> role.getRoleName().equals("USER")));
        assertNotNull(verification.getVerifiedAt());
    }
}
