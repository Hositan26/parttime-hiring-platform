package tanhs.fudn.parttime_hiring_plaform_project.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Store;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.admin.store.AdminStoreResponse;
import java.util.stream.Stream;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface AdminStoreMapper {
    // Maps independent approval and activity alongside the owning business.
    @Mapping(target = "employerId", source = "employer.employerId")
    @Mapping(target = "companyName", source = "employer.companyName")
    @Mapping(target = "address", expression = "java(address(store))")
    AdminStoreResponse toResponse(Store store);

    // Joins available address fields without displaying null fragments.
    default String address(Store store) {
        return Stream.of(store.getStreetAddress(), store.getWard(), store.getDistrict(), store.getCity())
                .filter(value -> value != null && !value.isBlank()).collect(Collectors.joining(", "));
    }
}
