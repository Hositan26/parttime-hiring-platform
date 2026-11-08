package tanhs.fudn.parttime_hiring_plaform_project.configuration;

import org.flywaydb.core.api.MigrationVersion;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.SQLException;
import java.io.IOException;
import java.util.zip.CRC32;

public class V1__DevelopmentDataMigration extends BaseJavaMigration {
    private final String password;
    private final Path assets;
    private final String assetBaseUrl;

    // Captures development inputs without storing credentials in migration resources.
    public V1__DevelopmentDataMigration(String password, Path assets, String assetBaseUrl) {
        this.password = password;
        this.assets = assets.toAbsolutePath().normalize();
        this.assetBaseUrl = assetBaseUrl;
    }

    // Uses an independent version sequence for development data migrations.
    @Override
    public MigrationVersion getVersion() {
        return MigrationVersion.fromVersion("1");
    }

    // Describes the fixture migration in its dedicated history table.
    @Override
    public String getDescription() {
        return "demo_data";
    }

    // Detects edits to committed fixture SQL on subsequent startups.
    @Override
    public Integer getChecksum() {
        var checksum = new CRC32();
        checksum.update(readFixtureSql());
        return (int) checksum.getValue();
    }

    // Loads fictional business data and private resumes once per dev database.
    @Override
    public void migrate(Context context) throws Exception {
        int length = password.getBytes(StandardCharsets.UTF_8).length;
        if (password.length() < 12 || length > 72) {
            throw new IllegalArgumentException("First dev initialization requires DEMO_SEED_PASSWORD (12+ characters, at most 72 UTF-8 bytes)");
        }
        if (!assetBaseUrl.matches("https?://[A-Za-z0-9.:/_-]+")) {
            throw new IllegalArgumentException("Invalid demo asset base URL");
        }
        byte[][] resumes = new byte[20][];
        for (int index = 0; index < resumes.length; index++) {
            resumes[index] = Files.readAllBytes(assets.resolve("resumes/candidate-%02d.pdf".formatted(index + 1)));
        }
        String sql = new String(readFixtureSql(), StandardCharsets.UTF_8)
                .replace("__DEMO_PASSWORD_HASH__", new BCryptPasswordEncoder().encode(password))
                .replace("__DEMO_ASSET_BASE__", assetBaseUrl);
        ScriptUtils.executeSqlScript(context.getConnection(), new ByteArrayResource(sql.getBytes(StandardCharsets.UTF_8)));
        loadResumes(context.getConnection(), resumes);
    }

    // Reads immutable SQL definitions packaged with the application.
    private byte[] readFixtureSql() {
        try {
            return new ClassPathResource("db/dev/data/demo.sql").getContentAsByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException("Cannot read development fixture SQL", exception);
        }
    }

    // Copies private PDFs into authenticated candidate profile storage.
    private void loadResumes(Connection connection, byte[][] resumes) throws SQLException {
        String sql = "UPDATE candidate_profiles p JOIN users u ON u.user_id=p.user_id SET p.resume_data=? WHERE u.username=?";
        try (var statement = connection.prepareStatement(sql)) {
            for (int index = 0; index < resumes.length; index++) {
                statement.setBytes(1, resumes[index]);
                statement.setString(2, "demo_user_%02d".formatted(index + 1));
                if (statement.executeUpdate() != 1) {
                    throw new IllegalStateException("Expected one development resume owner");
                }
            }
        }
    }
}
