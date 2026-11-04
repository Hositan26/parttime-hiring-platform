package tanhs.fudn.parttime_hiring_plaform_project.security;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import org.springframework.stereotype.Component;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.common.ApiResponse;
import tools.jackson.databind.ObjectMapper;

@Component
public class SecurityErrorWriter {
    private final ObjectMapper mapper;

    // Reuses the application's JSON configuration for security responses.
    public SecurityErrorWriter(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    // Writes a consistent JSON error without redirects or internal exception details.
    public void write(HttpServletResponse response, int status, String code, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        mapper.writeValue(response.getOutputStream(), ApiResponse.builder().status(status)
                .code(code).message(message).timestamp(Instant.now().toString()).build());
    }
}
