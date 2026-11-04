package tanhs.fudn.parttime_hiring_plaform_project.validator;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.ElementType;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = Utf8PasswordValidator.class)
public @interface Utf8Password {
    // Describes the supported password policy to API clients.
    String message() default "Password must contain at least 8 characters and at most 72 UTF-8 bytes";
    // Declares optional validation groups.
    Class<?>[] groups() default {};
    // Declares optional constraint metadata.
    Class<? extends Payload>[] payload() default {};
}
