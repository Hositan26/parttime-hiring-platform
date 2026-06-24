package tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.job;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EmployerJobCommentResponse {
    private Integer reviewId;
    private String reviewerName;
    private String reviewerAvatar;
    private Integer rating;
    private String comment;
    private String date;
}
