package tanhs.fudn.parttime_hiring_plaform_project.auth;

import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.auth.RegisterRequest;
import tanhs.fudn.parttime_hiring_plaform_project.mapper.AuthMapper;
import static org.junit.jupiter.api.Assertions.*;

class RegistrationUnitTest {
    // Rejects weak passwords and invalid registration identifiers.
    @Test
    void rejectsInvalidRegistration() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("a!");
        request.setPassword("short");
        request.setDisplayName(" ");
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            assertTrue(factory.getValidator().validate(request).size() >= 3);
        }
    }

    // Maps valid details without copying plaintext passwords or privileges.
    @Test
    void mapsSafeAccountFields() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("candidate");
        request.setPassword("StrongPass123");
        request.setDisplayName("Candidate");
        var user = Mappers.getMapper(AuthMapper.class).toUser(request);
        assertEquals("candidate", user.getUsername());
        assertNull(user.getPassword());
        assertTrue(user.getRoles().isEmpty());
    }
}
