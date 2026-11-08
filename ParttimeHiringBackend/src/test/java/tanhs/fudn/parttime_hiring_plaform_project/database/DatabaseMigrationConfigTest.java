package tanhs.fudn.parttime_hiring_plaform_project.database;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.configuration.Configuration;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;
import tanhs.fudn.parttime_hiring_plaform_project.configuration.DatabaseMigrationConfig;
import javax.sql.DataSource;
import java.sql.Connection;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class DatabaseMigrationConfigTest {
    // Rejects combined production and development before accessing any database.
    @Test
    void combinedProfilesCannotSeedProduction() {
        var environment = new MockEnvironment();
        environment.setActiveProfiles("dev", "prod");
        var common = mock(Flyway.class);
        var strategy = new DatabaseMigrationConfig().developmentMigrations(environment, "", true, ".", "http://localhost/demo");
        assertThrows(IllegalStateException.class, () -> strategy.migrate(common));
        verifyNoInteractions(common);
    }

    // Refuses a production catalog even when selected through dev configuration.
    @Test
    void developmentProfileCannotMigrateProductionCatalog() throws Exception {
        var common = mock(Flyway.class);
        var configuration = mock(Configuration.class);
        var dataSource = mock(DataSource.class);
        var connection = mock(Connection.class);
        when(common.getConfiguration()).thenReturn(configuration);
        when(configuration.getDataSource()).thenReturn(dataSource);
        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.getCatalog()).thenReturn("parttime_hiring_platform_prod");
        var strategy = new DatabaseMigrationConfig().developmentMigrations(new MockEnvironment(), "", true, ".", "http://localhost/demo");
        assertThrows(IllegalStateException.class, () -> strategy.migrate(common));
        verify(common, never()).migrate();
    }

    // Allows common-only bootstrap before restoring existing local business accounts.
    @Test
    void bootstrapMigratesOnlyCommonHistory() throws Exception {
        var common = mock(Flyway.class);
        var configuration = mock(Configuration.class);
        var dataSource = mock(DataSource.class);
        var connection = mock(Connection.class);
        when(common.getConfiguration()).thenReturn(configuration);
        when(configuration.getDataSource()).thenReturn(dataSource);
        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.getCatalog()).thenReturn("parttime_hiring_platform_dev");
        var strategy = new DatabaseMigrationConfig().developmentMigrations(new MockEnvironment(), "", false, ".", "http://localhost/demo");
        strategy.migrate(common);
        verify(common).migrate();
        verify(connection).close();
    }
}
