package tanhs.fudn.parttime_hiring_plaform_project.auth;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;
import tanhs.fudn.parttime_hiring_plaform_project.exception.RateLimitException;
import tanhs.fudn.parttime_hiring_plaform_project.security.AttemptRateLimiter;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RateLimitUnitTest {
    // Restores attempts after the configured throttle window expires.
    @Test
    void expiresWindows() {
        var clock = mock(Clock.class);
        when(clock.instant()).thenReturn(Instant.ofEpochSecond(0));
        var limiter = new AttemptRateLimiter(clock);
        limiter.check("login", "account", 1, 60);
        assertThrows(RateLimitException.class, () -> limiter.check("login", "account", 1, 60));
        when(clock.instant()).thenReturn(Instant.ofEpochSecond(61));
        assertDoesNotThrow(() -> limiter.check("login", "account", 1, 60));
    }

    // Preserves the exact request limit under concurrent login attempts.
    @Test
    void limitsConcurrentAttempts() {
        var limiter = new AttemptRateLimiter(Clock.fixed(Instant.EPOCH, ZoneOffset.UTC));
        var accepted = new AtomicInteger();
        IntStream.range(0, 100).parallel().forEach(index -> {
            try {
                limiter.check("login", "account", 10, 60);
                accepted.incrementAndGet();
            } catch (RateLimitException expected) {
                // Rejected attempts must not increase the accepted count.
            }
        });
        assertEquals(10, accepted.get());
    }
}
