package tanhs.fudn.parttime_hiring_plaform_project.security;
import java.time.Clock;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;
import tanhs.fudn.parttime_hiring_plaform_project.exception.RateLimitException;

@Component
public class AttemptRateLimiter {
    private static final int MAX_KEYS = 10_000;
    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();
    private final Clock clock;

    // Uses UTC time for process-local authentication throttling.
    public AttemptRateLimiter() {
        this(Clock.systemUTC());
    }

    // Allows deterministic clocks for throttling tests.
    public AttemptRateLimiter(Clock clock) {
        this.clock = clock;
    }

    // Atomically limits attempts while bounding retained client metadata.
    public void check(String scope, String identity, int maximum, long seconds) {
        long now = clock.instant().getEpochSecond();
        String key = TokenDigests.hash(scope + ":" + identity);
        if (windows.size() >= MAX_KEYS && !windows.containsKey(key)) {
            windows.entrySet().removeIf(entry -> entry.getValue().expiresAt <= now);
            if (windows.size() >= MAX_KEYS) throw new RateLimitException();
        }
        windows.compute(key, (ignored, previous) -> {
            Window current = previous == null || previous.expiresAt <= now ? new Window(now + seconds, 0) : previous;
            if (current.attempts >= maximum) throw new RateLimitException();
            return new Window(current.expiresAt, current.attempts + 1);
        });
    }

    private record Window(long expiresAt, int attempts) {}
}
