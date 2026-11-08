package tanhs.fudn.parttime_hiring_plaform_project.validator;
import java.nio.charset.StandardCharsets;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class Utf8PasswordValidator implements ConstraintValidator<Utf8Password, String> {
    // Enforces BCrypt's byte limit without silently truncating Unicode passwords.
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return value == null || (value.length() >= 8 && value.getBytes(StandardCharsets.UTF_8).length <= 72);
    }
}
