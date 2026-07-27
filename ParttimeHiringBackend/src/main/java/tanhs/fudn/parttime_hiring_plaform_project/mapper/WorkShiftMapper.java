package tanhs.fudn.parttime_hiring_plaform_project.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.admin.ShiftRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.ShiftResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.WorkShift;

@Mapper(componentModel = "spring")
public interface WorkShiftMapper {
    ShiftResponse toResponse(WorkShift entity);
    WorkShift toEntity(ShiftRequest request);
    
    @Mapping(target = "shiftId", ignore = true)
    void updateEntity(@MappingTarget WorkShift entity, ShiftRequest request);
}
