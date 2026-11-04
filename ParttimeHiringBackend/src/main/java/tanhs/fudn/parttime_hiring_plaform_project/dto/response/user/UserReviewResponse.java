package tanhs.fudn.parttime_hiring_plaform_project.dto.response.user;

import lombok.Data;

@Data
public class UserReviewResponse {
    private Integer reviewId;
    private Integer rating;
    private String comment;
    private String status;
}
