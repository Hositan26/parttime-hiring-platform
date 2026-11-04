package tanhs.fudn.parttime_hiring_plaform_project.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employment.EmploymentRecord;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.user.EmploymentHistoryResponse;

@Mapper(componentModel = "spring")
public interface EmploymentHistoryMapper {
    // Exposes employment history without internal employer verification or account data.
    @Mapping(target = "id", source = "employmentRecordId")
    @Mapping(target = "storeName", source = "store.storeName")
    @Mapping(target = "jobTitle", source = "jobPost.title")
    EmploymentHistoryResponse toResponse(EmploymentRecord record);
}
