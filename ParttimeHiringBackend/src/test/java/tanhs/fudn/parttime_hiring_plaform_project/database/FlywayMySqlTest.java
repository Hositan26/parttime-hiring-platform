package tanhs.fudn.parttime_hiring_plaform_project.database;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.MigrationVersion;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.flywaydb.core.api.exception.FlywayValidateException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import tanhs.fudn.parttime_hiring_plaform_project.configuration.V1__DevelopmentDataMigration;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

@EnabledIfEnvironmentVariable(named = "MYSQL_MIGRATION_TESTS", matches = "true")
class FlywayMySqlTest {
    private String database;
    private String url;
    private Connection connection;
    private final String baseUrl = System.getenv("MYSQL_TEST_URL");
    private final String username = System.getenv("MYSQL_TEST_USERNAME");
    private final String password = System.getenv("MYSQL_TEST_PASSWORD");

    // Creates a disposable schema isolated from persistent dev and prod databases.
    @BeforeEach
    void createDatabase() throws Exception {
        database = "parttime_flyway_test_" + UUID.randomUUID().toString().replace("-", "");
        try (var server = DriverManager.getConnection(baseUrl, username, password);
             var statement = server.createStatement()) {
            statement.execute("CREATE DATABASE `" + database + "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        }
        url = baseUrl + "/" + database;
        connection = DriverManager.getConnection(url, username, password);
    }

    // Removes only this test's uniquely named disposable database.
    @AfterEach
    void removeDatabase() throws Exception {
        if (connection != null) {
            connection.close();
        }
        if (database != null && database.matches("parttime_flyway_test_[a-f0-9]{32}")) {
            try (var server = DriverManager.getConnection(baseUrl, username, password);
                 var statement = server.createStatement()) {
                statement.execute("DROP DATABASE `" + database + "`");
            }
        }
    }

    // Confirms production migrations contain reference data without demo identities.
    @Test
    void commonMigrationsCreateReferenceDataOnlyAndRerunSafely() throws Exception {
        var common = common();
        assertEquals(3, common.migrate().migrationsExecuted);
        assertEquals(3, count("SELECT COUNT(*) FROM role"));
        assertEquals(12, count("SELECT COUNT(*) FROM job_categories"));
        assertEquals(6, count("SELECT COUNT(*) FROM work_shifts"));
        assertEquals(0, count("SELECT COUNT(*) FROM users"));
        assertEquals(0, count("SELECT COUNT(*) FROM job_posts"));
        assertEquals(0, count("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name='flyway_dev_seed_history'"));
        assertEquals(0, common.migrate().migrationsExecuted);
    }

    // Checks coherent fixtures, protected CV storage, and unchanged credentials after restart.
    @Test
    void devFixturesRemainIdempotentAndDoNotBlockFutureCommonVersions() throws Exception {
        common().migrate();
        var dev = dev("Migration-test-password!", Path.of("../database/demo"));
        assertEquals(1, dev.migrate().migrationsExecuted);
        assertEquals(52, count("SELECT COUNT(*) FROM users"));
        assertEquals(80, count("SELECT COUNT(*) FROM job_posts"));
        assertEquals(120, count("SELECT COUNT(*) FROM job_applications"));
        assertEquals(30, count("SELECT COUNT(*) FROM employment_records"));
        assertEquals(20, count("SELECT COUNT(*) FROM candidate_profiles WHERE resume_data IS NOT NULL AND LEFT(resume_data,5)='%PDF-'"));
        assertEquals(12, count("SELECT COUNT(*) FROM job_categories"));
        assertEquals(6, count("SELECT COUNT(*) FROM work_shifts"));
        assertEquals(44, count("SELECT COUNT(*) FROM job_posts j JOIN stores s ON s.store_id=j.store_id JOIN employers e ON e.employer_id=j.employer_id WHERE j.status='ACTIVE' AND j.moderation_blocked=0 AND j.published_at<=NOW() AND j.expired_at>NOW() AND s.is_active=1 AND s.is_approved=1 AND e.status='ACTIVE'"));
        assertEquals(0, count("SELECT COUNT(*) FROM job_applications a JOIN job_posts j ON j.job_post_id=a.job_post_id WHERE a.applied_at<j.published_at OR a.updated_at<a.applied_at"));
        String originalHash;
        try (var statement = connection.createStatement();
             var rows = statement.executeQuery("SELECT password FROM users WHERE username='demo_admin_01'")) {
            assertTrue(rows.next());
            originalHash = rows.getString(1);
        }
        assertTrue(new BCryptPasswordEncoder().matches("Migration-test-password!", originalHash));
        assertEquals(0, dev("", Path.of("../database/demo")).migrate().migrationsExecuted);
        assertEquals(52, count("SELECT COUNT(*) FROM users"));
        assertEquals(0, common().migrate().migrationsExecuted);
        assertEquals(3, count("SELECT COUNT(*) FROM flyway_schema_history WHERE success=1"));
        // A future common V4 remains pending independently of dev V1.
        var future = new V4__FutureCommonProbe();
        assertEquals(1, Flyway.configure().dataSource(url, username, password)
                .locations("classpath:db/migration").javaMigrations(future).load().migrate().migrationsExecuted);
        assertEquals(0, dev.migrate().migrationsExecuted);
    }

    // Refuses missing private assets before inserting any fictional accounts.
    @Test
    void missingAssetsFailWithoutPartialBusinessRows() throws Exception {
        common().migrate();
        assertThrows(Exception.class, () -> dev("Migration-test-password!", Path.of("missing-fixture-assets")).migrate());
        assertEquals(0, count("SELECT COUNT(*) FROM users"));
        assertEquals(0, count("SELECT COUNT(*) FROM job_posts"));
    }

    // Rolls back earlier fixture inserts when an existing username collides mid-migration.
    @Test
    void fixtureConflictRollsBackAllNewAccounts() throws Exception {
        common().migrate();
        try (var statement = connection.createStatement()) {
            statement.execute("INSERT INTO users(username,display_name,is_active) VALUES ('demo_user_40','Existing account',1)");
        }
        assertThrows(Exception.class, () -> dev("Migration-test-password!", Path.of("../database/demo")).migrate());
        assertEquals(1, count("SELECT COUNT(*) FROM users"));
        assertEquals(0, count("SELECT COUNT(*) FROM users WHERE username='demo_admin_01'"));
        assertEquals(0, count("SELECT COUNT(*) FROM employers"));
    }

    // Rejects modified fixture definitions rather than silently resetting existing demo data.
    @Test
    void modifiedFixtureChecksumRequiresANewMigration() throws Exception {
        common().migrate();
        dev("Migration-test-password!", Path.of("../database/demo")).migrate();
        var modified = Flyway.configure().dataSource(url, username, password).locations(new String[0])
                .table("flyway_dev_seed_history").baselineOnMigrate(true).baselineVersion("0")
                .javaMigrations(new V1__ChangedChecksum()).cleanDisabled(true).load();
        assertThrows(FlywayValidateException.class, modified::migrate);
        assertEquals(52, count("SELECT COUNT(*) FROM users"));
    }

    // Configures production-equivalent SQL migration locations for the disposable schema.
    private Flyway common() {
        return Flyway.configure().dataSource(url, username, password).locations("classpath:db/migration").cleanDisabled(true).load();
    }

    // Configures isolated development history against the same disposable schema.
    private Flyway dev(String fixturePassword, Path assets) {
        return Flyway.configure().dataSource(url, username, password).locations(new String[0])
                .table("flyway_dev_seed_history").baselineOnMigrate(true).baselineVersion("0")
                .javaMigrations(new V1__DevelopmentDataMigration(fixturePassword, assets, "http://localhost:8088/parttime_hiring_platform/demo"))
                .cleanDisabled(true).load();
    }

    // Reads scalar counts without exposing business rows or credentials.
    private int count(String sql) throws Exception {
        try (var statement = connection.createStatement(); var rows = statement.executeQuery(sql)) {
            assertTrue(rows.next());
            return rows.getInt(1);
        }
    }
    static class V4__FutureCommonProbe extends BaseJavaMigration {
        // Defines the next shared schema version independently from fixture history.
        @Override
        public MigrationVersion getVersion() {
            return MigrationVersion.fromVersion("4");
        }
        // Names the disposable common migration used for ordering verification.
        @Override
        public String getDescription() {
            return "future_common_probe";
        }
        // Creates a probe table to confirm later common migrations execute.
        @Override
        public void migrate(Context context) throws Exception {
            try (var statement = context.getConnection().createStatement()) {
                statement.execute("CREATE TABLE future_common_probe (id INT PRIMARY KEY)");
            }
        }

    }


    static class V1__ChangedChecksum extends V1__DevelopmentDataMigration {
        // Supplies unchanged development inputs while simulating a resource checksum edit.
        V1__ChangedChecksum() {
            super("Migration-test-password!", Path.of("../database/demo"), "http://localhost/demo");
        }

        // Changes only the checksum to exercise Flyway validation failure.
        @Override
        public Integer getChecksum() {
            return super.getChecksum() + 1;
        }
    }

}
