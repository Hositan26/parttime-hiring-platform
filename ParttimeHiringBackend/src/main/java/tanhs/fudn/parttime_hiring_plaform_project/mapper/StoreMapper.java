package tanhs.fudn.parttime_hiring_plaform_project.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tanhs.fudn.parttime_hiring_plaform_project.dto.employer.store.EmployerStoreDetailResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.employer.store.EmployerStoreResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Store;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;

import java.util.List;

@Mapper(componentModel = "spring")
public interface StoreMapper {

    @Mapping(target = "name", source = "store.storeName")
    @Mapping(target = "phone", expression = "java(store.getPhoneContact() != null ? store.getPhoneContact() : employerPhone)")
    @Mapping(target = "address", expression = "java((store.getStreetAddress() != null ? store.getStreetAddress() : \"\") + \", \" + (store.getWard() != null ? store.getWard() : \"\") + \", \" + (store.getDistrict() != null ? store.getDistrict() : \"\") + \", \" + (store.getCity() != null ? store.getCity() : \"\"))")
    @Mapping(target = "jobs", source = "jobsCount")
    @Mapping(target = "applications", source = "applicationsCount")
    @Mapping(target = "status", expression = "java(store.getIsActive() ? \"ACTIVE\" : \"INACTIVE\")")
    @Mapping(target = "logo", constant = "https://cdn-icons-png.flaticon.com/512/3268/3268832.png")
    EmployerStoreResponse toEmployerStoreResponse(Store store, long jobsCount, long applicationsCount, String employerPhone);

    @Mapping(target = "name", source = "store.storeName")
    @Mapping(target = "phone", expression = "java(store.getPhoneContact() != null ? store.getPhoneContact() : employerPhone)")
    @Mapping(target = "address", expression = "java((store.getStreetAddress() != null ? store.getStreetAddress() : \"\") + \", \" + (store.getWard() != null ? store.getWard() : \"\") + \", \" + (store.getDistrict() != null ? store.getDistrict() : \"\") + \", \" + (store.getCity() != null ? store.getCity() : \"\"))")
    @Mapping(target = "jobs", constant = "0L")
    @Mapping(target = "applications", constant = "0L")
    @Mapping(target = "status", constant = "INACTIVE")
    @Mapping(target = "logo", expression = "java(\"https://ui-avatars.com/api/?name=\" + store.getStoreName().replace(\" \", \"+\") + \"&background=random\")")
    EmployerStoreResponse toNewEmployerStoreResponse(Store store, String employerPhone);

    @Mapping(target = "name", source = "store.storeName")
    @Mapping(target = "phone", expression = "java(store.getPhoneContact() != null ? store.getPhoneContact() : employerPhone)")
    @Mapping(target = "address", expression = "java((store.getStreetAddress() != null ? store.getStreetAddress() : \"\") + \", \" + (store.getWard() != null ? store.getWard() : \"\") + \", \" + (store.getDistrict() != null ? store.getDistrict() : \"\") + \", \" + (store.getCity() != null ? store.getCity() : \"\"))")
    @Mapping(target = "jobs", source = "jobsCount")
    @Mapping(target = "applications", source = "applicationsCount")
    @Mapping(target = "status", expression = "java(store.getIsActive() ? \"ACTIVE\" : \"PAUSED\")")
    @Mapping(target = "logo", expression = "java(\"https://ui-avatars.com/api/?name=\" + store.getStoreName().replace(\" \", \"+\") + \"&background=random\")")
    EmployerStoreResponse toToggledEmployerStoreResponse(Store store, long jobsCount, long applicationsCount, String employerPhone);

    @Mapping(target = "jobId", source = "jobPost.jobPostId")
    @Mapping(target = "applications", source = "applicationsCount")
    EmployerStoreDetailResponse.StoreJobDTO toStoreJobDTO(JobPost jobPost, long applicationsCount);

    @Mapping(target = "name", source = "store.storeName")
    @Mapping(target = "phone", expression = "java(store.getPhoneContact() != null ? store.getPhoneContact() : employerPhone)")
    @Mapping(target = "address", expression = "java((store.getStreetAddress() != null ? store.getStreetAddress() : \"\") + \", \" + (store.getWard() != null ? store.getWard() : \"\") + \", \" + (store.getDistrict() != null ? store.getDistrict() : \"\") + \", \" + (store.getCity() != null ? store.getCity() : \"\"))")
    @Mapping(target = "status", expression = "java(store.getIsActive() ? \"ACTIVE\" : \"INACTIVE\")")
    @Mapping(target = "logo", constant = "https://cdn-icons-png.flaticon.com/512/3268/3268832.png")
    @Mapping(target = "jobs", source = "jobs")
    EmployerStoreDetailResponse toEmployerStoreDetailResponse(Store store, String employerPhone, List<EmployerStoreDetailResponse.StoreJobDTO> jobs);
}
