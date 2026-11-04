package tanhs.fudn.parttime_hiring_plaform_project.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.BeanMapping;
import org.mapstruct.MappingTarget;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.user.ReviewRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.UserReviewResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.review.StoreReview;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employment.EmploymentRecord;

@Mapper(componentModel = "spring")
public interface UserReviewMapper {
    // Binds a new review to a verified employment and authenticated reviewer.
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "reviewer", source = "user")
    @Mapping(target = "employmentRecord", source = "employment")
    @Mapping(target = "store", source = "employment.store")
    @Mapping(target = "rating", source = "request.rating")
    @Mapping(target = "comment", source = "request.comment")
    @Mapping(target = "status", constant = "VISIBLE")
    StoreReview create(ReviewRequest request, EmploymentRecord employment, User user);
    // Edits review content without overriding administrator moderation decisions.
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "rating", source = "rating")
    @Mapping(target = "comment", source = "comment")
    void update(ReviewRequest request, @MappingTarget StoreReview review);
    // Exposes only the review's public content and moderation state.
    UserReviewResponse toResponse(StoreReview review);
}
