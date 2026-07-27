package tanhs.fudn.parttime_hiring_plaform_project.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.admin.CategoryRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.CategoryResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobCategory;

@Mapper(componentModel = "spring")
public interface JobCategoryMapper {
    CategoryResponse toResponse(JobCategory entity);
    JobCategory toEntity(CategoryRequest request);
    
    @Mapping(target = "categoryId", ignore = true)
    @Mapping(target = "slug", ignore = true)
    void updateEntity(@MappingTarget JobCategory entity, CategoryRequest request);
}
