package tanhs.fudn.parttime_hiring_plaform_project.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.store.EmployerStoreDetailResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.store.EmployerStoreResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Store;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;

import java.util.List;

@Mapper(componentModel = "spring", imports = tanhs.fudn.parttime_hiring_plaform_project.service.employer.StoreApprovalPolicy.class)
public interface StoreMapper {

    @Mapping(target = "name", source = "store.storeName")
    @Mapping(target = "phone", expression = "java(store.getPhoneContact() != null ? store.getPhoneContact() : employerPhone)")
    @Mapping(target = "address", expression = "java((store.getStreetAddress() != null ? store.getStreetAddress() : \"\") + \", \" + (store.getWard() != null ? store.getWard() : \"\") + \", \" + (store.getDistrict() != null ? store.getDistrict() : \"\") + \", \" + (store.getCity() != null ? store.getCity() : \"\"))")
    @Mapping(target = "jobs", source = "jobsCount")
    @Mapping(target = "applications", source = "applicationsCount")
    @Mapping(target = "status", expression = "java(StoreApprovalPolicy.status(store))")
    @Mapping(target = "logo", constant = "https://cdn-icons-png.flaticon.com/512/3268/3268832.png")
    EmployerStoreResponse toEmployerStoreResponse(Store store, long jobsCount, long applicationsCount, String employerPhone);

    @Mapping(target = "name", source = "store.storeName")
    @Mapping(target = "phone", expression = "java(store.getPhoneContact() != null ? store.getPhoneContact() : employerPhone)")
    @Mapping(target = "address", expression = "java((store.getStreetAddress() != null ? store.getStreetAddress() : \"\") + \", \" + (store.getWard() != null ? store.getWard() : \"\") + \", \" + (store.getDistrict() != null ? store.getDistrict() : \"\") + \", \" + (store.getCity() != null ? store.getCity() : \"\"))")
    @Mapping(target = "jobs", constant = "0L")
    @Mapping(target = "applications", constant = "0L")
    @Mapping(target = "status", constant = "PENDING")
    @Mapping(target = "logo", expression = "java(\"https://ui-avatars.com/api/?name=\" + store.getStoreName().replace(\" \", \"+\") + \"&background=random\")")
    EmployerStoreResponse toNewEmployerStoreResponse(Store store, String employerPhone);

    @Mapping(target = "name", source = "store.storeName")
    @Mapping(target = "phone", expression = "java(store.getPhoneContact() != null ? store.getPhoneContact() : employerPhone)")
    @Mapping(target = "address", expression = "java((store.getStreetAddress() != null ? store.getStreetAddress() : \"\") + \", \" + (store.getWard() != null ? store.getWard() : \"\") + \", \" + (store.getDistrict() != null ? store.getDistrict() : \"\") + \", \" + (store.getCity() != null ? store.getCity() : \"\"))")
    @Mapping(target = "jobs", source = "jobsCount")
    @Mapping(target = "applications", source = "applicationsCount")
    @Mapping(target = "status", expression = "java(StoreApprovalPolicy.status(store))")
    @Mapping(target = "logo", expression = "java(\"https://ui-avatars.com/api/?name=\" + store.getStoreName().replace(\" \", \"+\") + \"&background=random\")")
    EmployerStoreResponse toToggledEmployerStoreResponse(Store store, long jobsCount, long applicationsCount, String employerPhone);

    @Mapping(target = "jobId", source = "jobPost.jobPostId")
    @Mapping(target = "applications", source = "applicationsCount")
    EmployerStoreDetailResponse.StoreJobDTO toStoreJobDTO(JobPost jobPost, long applicationsCount);

    // Keeps the editable street address separate from the formatted display address.
    @Mapping(target = "streetAddress", source = "store.streetAddress")
    @Mapping(target = "coverImageUrl", source = "store.coverImageUrl")
    @Mapping(target = "name", source = "store.storeName")
    @Mapping(target = "phone", expression = "java(store.getPhoneContact() != null ? store.getPhoneContact() : employerPhone)")
    @Mapping(target = "address", expression = "java((store.getStreetAddress() != null ? store.getStreetAddress() : \"\") + \", \" + (store.getWard() != null ? store.getWard() : \"\") + \", \" + (store.getDistrict() != null ? store.getDistrict() : \"\") + \", \" + (store.getCity() != null ? store.getCity() : \"\"))")
    @Mapping(target = "status", expression = "java(StoreApprovalPolicy.status(store))")
    @Mapping(target = "logo", constant = "https://cdn-icons-png.flaticon.com/512/3268/3268832.png")
    @Mapping(target = "jobs", source = "jobs")
    EmployerStoreDetailResponse toEmployerStoreDetailResponse(Store store, String employerPhone, List<EmployerStoreDetailResponse.StoreJobDTO> jobs);
}
