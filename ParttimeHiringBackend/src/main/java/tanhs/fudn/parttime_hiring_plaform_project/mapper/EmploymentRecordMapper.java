package tanhs.fudn.parttime_hiring_plaform_project.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.EmployerEmploymentResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employment.EmploymentRecord;

@Mapper(componentModel = "spring")
public interface EmploymentRecordMapper {
    @Mapping(target = "recordId", source = "employmentRecordId")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "employeeName", source = "user.displayName")
    @Mapping(target = "employeeAvatar", source = "user.avatarUrl")
    @Mapping(target = "employeePhone", source = "application.contactPhone")
    @Mapping(target = "employeeEmail", source = "user.email")
    @Mapping(target = "jobPostId", source = "jobPost.jobPostId")
    @Mapping(target = "jobTitle", source = "jobPost.title")
    @Mapping(target = "storeId", source = "store.storeId")
    @Mapping(target = "storeName", source = "store.storeName")
    @Mapping(target = "storeAddress", source = "store.streetAddress")
    @Mapping(target = "applicationId", source = "application.applicationId")
    EmployerEmploymentResponse toEmployerEmploymentResponse(EmploymentRecord record);
}
