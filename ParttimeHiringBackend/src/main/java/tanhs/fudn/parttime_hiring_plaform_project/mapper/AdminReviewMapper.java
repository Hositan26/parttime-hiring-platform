package tanhs.fudn.parttime_hiring_plaform_project.mapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tanhs.fudn.parttime_hiring_plaform_project.entity.review.StoreReview;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.review.AdminReviewResponse;

@Mapper(componentModel = "spring")
public interface AdminReviewMapper {
    // Maps review moderation details without disclosing private employment documents.
    @Mapping(target = "storeName", source = "store.storeName")
    @Mapping(target = "reviewerName", source = "reviewer.displayName")
    @Mapping(target = "reviewerUsername", source = "reviewer.username")
    AdminReviewResponse toResponse(StoreReview review);
}
