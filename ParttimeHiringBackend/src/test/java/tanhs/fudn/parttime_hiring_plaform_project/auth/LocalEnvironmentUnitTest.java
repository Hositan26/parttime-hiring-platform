package tanhs.fudn.parttime_hiring_plaform_project.auth;

import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.boot.test.context.ConfigDataApplicationContextInitializer;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class LocalEnvironmentUnitTest {
    @TempDir Path directory;

    // Resolves OAuth placeholders from a local environment file without exposing credentials.
    @Test
    void importsLocalEnvironmentProperties() throws Exception {
        Path environment = directory.resolve(".env");
        Files.writeString(environment, "GOOGLE_CLIENT_ID=test-client.apps.googleusercontent.com\n"
                + "GOOGLE_CLIENT_SECRET=test-only-secret\n");
        new ApplicationContextRunner()
                .withPropertyValues("spring.config.location=optional:classpath:/nonexistent-oauth-test.yml",
                        "spring.config.import=" + environment.toUri() + "[.properties]",
                        "oauth.test-client=${GOOGLE_CLIENT_ID:local-disabled}")
                .withInitializer(new ConfigDataApplicationContextInitializer())
                .run(context -> {
                    assertNull(context.getStartupFailure());
                    assertEquals("test-client.apps.googleusercontent.com",
                            context.getEnvironment().getProperty("oauth.test-client"));
                });
    }
}
