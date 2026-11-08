package tanhs.fudn.parttime_hiring_plaform_project.configuration;

import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.flyway.autoconfigure.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import java.nio.file.Path;
import java.sql.SQLException;

@Configuration
@Profile("dev & !test")
public class DatabaseMigrationConfig {
    // Migrates common schema before applying isolated development fixtures.
    @Bean
    public FlywayMigrationStrategy developmentMigrations(Environment environment,
            @Value("${app.demo.password:}") String password,
            @Value("${app.demo.enabled:true}") boolean seedEnabled,
            @Value("${app.demo.assets-directory}") String assetsDirectory,
            @Value("${app.demo.asset-base-url}") String assetBaseUrl) {
        return common -> {
            if (environment.acceptsProfiles(Profiles.of("prod"))) {
                throw new IllegalStateException("The dev and prod profiles cannot be combined");
            }
            try (var connection = common.getConfiguration().getDataSource().getConnection()) {
                if (!"parttime_hiring_platform_dev".equals(connection.getCatalog())) {
                    throw new IllegalStateException("Development seeding requires parttime_hiring_platform_dev");
                }
            } catch (SQLException exception) {
                throw new IllegalStateException("Cannot verify the development database", exception);
            }
            common.migrate();
            if (!seedEnabled) {
                return;
            }
            Flyway.configure().dataSource(common.getConfiguration().getDataSource())
                    .locations(new String[0]).table("flyway_dev_seed_history")
                    .baselineOnMigrate(true).baselineVersion("0").cleanDisabled(true)
                    .javaMigrations(new V1__DevelopmentDataMigration(password, Path.of(assetsDirectory), assetBaseUrl))
                    .load().migrate();
        };
    }
}
