package tanhs.fudn.parttime_hiring_plaform_project.exception;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    // Reports throttled authentication attempts without leaking account information.
    @ExceptionHandler(RateLimitException.class)
    public ResponseEntity<ApiResponse<Object>> rateLimit(RateLimitException exception) {
        return ResponseEntity.status(429).header("Retry-After", "900").body(error(429, "RATE_LIMITED", exception.getMessage(), null).getBody());
    }
    // Maps missing resources to a predictable not-found response.
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> notFound(ResourceNotFoundException exception) {
        return error(404, "NOT_FOUND", exception.getMessage(), null);
    }

    // Reports business validation failures without treating them as server errors.
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Object>> business(BusinessException exception) {
        return error(400, "BAD_REQUEST", exception.getMessage(), null);
    }

    // Returns unauthorized responses for missing or invalid credentials.
    @ExceptionHandler({UnauthorizedException.class, AuthenticationException.class})
    public ResponseEntity<ApiResponse<Object>> unauthorized(Exception exception) {
        return error(401, "UNAUTHORIZED", "Authentication is required or credentials are invalid", null);
    }

    // Returns forbidden responses for failed role or ownership checks.
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> forbidden(AccessDeniedException exception) {
        return error(403, "FORBIDDEN", "You do not have permission to perform this action", null);
    }

    // Reports field validation errors in a consistent API envelope.
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> validation(MethodArgumentNotValidException exception) {
        Map<String, String> errors = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().forEach(field ->
                errors.putIfAbsent(field.getField(), field.getDefaultMessage()));
        return error(400, "VALIDATION_ERROR", "Please check the submitted fields", errors);
    }

    // Rejects malformed JSON without exposing deserialization internals.
    @ExceptionHandler({HttpMessageNotReadableException.class, org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ApiResponse<Object>> malformed(Exception exception) {
        return error(400, "BAD_REQUEST", "Request data is invalid", null);
    }

    // Converts database uniqueness and relationship conflicts into public errors.
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Object>> conflict(DataIntegrityViolationException exception) {
        return error(409, "CONFLICT", "The request conflicts with existing data", null);
    }

    // Hides implementation details when an unexpected failure occurs.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> unexpected(Exception exception) {
        log.error("Unhandled request failure of type {}", exception.getClass().getSimpleName());
        return error(500, "INTERNAL_SERVER_ERROR", "An unexpected error occurred", null);
    }

    // Builds the standard error envelope for each handled failure.
    private ResponseEntity<ApiResponse<Object>> error(int status, String code, String message, Object result) {
        return ResponseEntity.status(status).body(ApiResponse.builder().status(status).code(code)
                .message(message).result(result).timestamp(Instant.now().toString()).build());
    }
}

