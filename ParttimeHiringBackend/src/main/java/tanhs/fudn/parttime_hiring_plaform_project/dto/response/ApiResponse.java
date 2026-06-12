package tanhs.fudn.parttime_hiring_plaform_project.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ApiResponse<T> {
    
    @Builder.Default
    int status = 200;
    
    @Builder.Default
    String code = "SUCCESS";
    
    String message;
    
    T result;
    
    @Builder.Default
    String timestamp = Instant.now().toString();

    public static <T> ApiResponse<T> success(T result) {
        return ApiResponse.<T>builder()
                .result(result)
                .message("Operation successful")
                .build();
    }
}
