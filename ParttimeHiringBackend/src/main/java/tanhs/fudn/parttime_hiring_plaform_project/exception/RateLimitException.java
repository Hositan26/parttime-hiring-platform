package tanhs.fudn.parttime_hiring_plaform_project.exception;
public class RateLimitException extends RuntimeException {
    // Signals temporary throttling without disclosing account information.
    public RateLimitException() {
        super("Too many attempts. Please try again later");
    }
}
