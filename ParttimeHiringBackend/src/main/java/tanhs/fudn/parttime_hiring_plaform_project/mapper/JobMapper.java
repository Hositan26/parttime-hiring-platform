package tanhs.fudn.parttime_hiring_plaform_project.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.job.CategoryResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.job.JobPostDetailResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.job.JobPostResponse;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.job.ShiftResponse;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobCategory;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.WorkShift;

import java.text.DecimalFormat;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface JobMapper {

    @Mapping(target = "id", source = "categoryId")
    @Mapping(target = "name", source = "categoryName")
    CategoryResponse toCategoryResponse(JobCategory category);

    @Mapping(target = "id", source = "shiftId")
    @Mapping(target = "name", source = "shiftName")
    ShiftResponse toShiftResponse(WorkShift shift);

    @Mapping(target = "id", source = "jobPostId")
    @Mapping(target = "store", expression = "java(formatStoreShort(job))")
    @Mapping(target = "location", expression = "java(formatAddressShort(job))")
    @Mapping(target = "salary", expression = "java(formatSalaryShort(job))")
    @Mapping(target = "shifts", expression = "java(getShiftNames(job))")
    @Mapping(target = "headcount", source = "vacancyCount")
    @Mapping(target = "date", expression = "java(formatDateShort(job))")
    @Mapping(target = "status", expression = "java(job.getStatus() != null ? job.getStatus().name() : \"\")")
    JobPostResponse toJobPostResponse(JobPost job);

    @Mapping(target = "id", source = "jobPostId")
    @Mapping(target = "storeName", expression = "java(job.getStore() != null ? job.getStore().getStoreName() : \"Unknown Store\")")
    @Mapping(target = "company", expression = "java(job.getStore() != null && job.getStore().getEmployer() != null ? job.getStore().getEmployer().getCompanyName() : \"Unknown Company\")")
    @Mapping(target = "phoneContact", expression = "java(getPhoneContact(job))")
    @Mapping(target = "address", expression = "java(job.getStore() != null ? job.getStore().getCity() : \"\")")
    @Mapping(target = "fullAddress", expression = "java(formatFullAddress(job))")
    @Mapping(target = "wage", expression = "java(formatSalaryDetail(job))")
    @Mapping(target = "headcount", source = "vacancyCount")
    @Mapping(target = "gender", expression = "java(job.getGenderRequirement() != null ? job.getGenderRequirement().name() : \"ANY\")")
    @Mapping(target = "ageRange", expression = "java((job.getMinAge() != null ? job.getMinAge() : \"18\") + \" - \" + (job.getMaxAge() != null ? job.getMaxAge() : \"25\") + \" tuổi\")")
    @Mapping(target = "description", source = "jobDescription")
    @Mapping(target = "postedDate", expression = "java(job.getPublishedAt() != null ? job.getPublishedAt().toLocalDate().toString() : \"\")")
    @Mapping(target = "expiredDate", expression = "java(job.getExpiredAt() != null ? job.getExpiredAt().toLocalDate().toString() : \"\")")
    @Mapping(target = "shifts", expression = "java(getShiftNames(job))")
    @Mapping(target = "categories", expression = "java(getCategoryNames(job))")
    @Mapping(target = "images", expression = "java(getImageUrls(job))")
    @Mapping(target = "status", expression = "java(job.getStatus() != null ? job.getStatus().name() : \"\")")
    JobPostDetailResponse toJobPostDetailResponse(JobPost job);

    default String formatStoreShort(JobPost job) {
        if (job.getStore() == null) return "";
        String storeStr = job.getStore().getStoreName();
        if (job.getStore().getDistrict() != null) {
            storeStr += " • " + job.getStore().getDistrict();
        }
        return storeStr;
    }

    default String formatAddressShort(JobPost job) {
        if (job.getStore() == null) return "";
        String address = job.getStore().getStreetAddress() != null ? job.getStore().getStreetAddress() : "";
        if (job.getStore().getWard() != null) address += ", " + job.getStore().getWard();
        if (job.getStore().getDistrict() != null) address += ", " + job.getStore().getDistrict();
        if (job.getStore().getCity() != null) address += ", " + job.getStore().getCity();
        if (address.startsWith(", ")) address = address.substring(2);
        return address;
    }

    default String formatSalaryShort(JobPost job) {
        if (job.getHourlyWageMin() == null) return "";
        DecimalFormat df = new DecimalFormat("#,###");
        if (job.getHourlyWageMax() != null) {
            return df.format(job.getHourlyWageMin()) + "đ - " + df.format(job.getHourlyWageMax()) + "đ/giờ";
        }
        return df.format(job.getHourlyWageMin()) + "đ/giờ";
    }

    default String formatDateShort(JobPost job) {
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        if (job.getPublishedAt() != null) return job.getPublishedAt().format(dtf);
        if (job.getCreatedAt() != null) return job.getCreatedAt().format(dtf);
        return "";
    }

    default List<String> getShiftNames(JobPost job) {
        if (job.getShifts() == null) return List.of();
        return job.getShifts().stream().map(WorkShift::getShiftName).collect(Collectors.toList());
    }

    default String getPhoneContact(JobPost job) {
        if (job.getStore() != null && job.getStore().getEmployer() != null && job.getStore().getEmployer().getPhoneContact() != null) {
            return job.getStore().getEmployer().getPhoneContact();
        }
        return "0914 768 239"; // Mock
    }

    default String formatFullAddress(JobPost job) {
        if (job.getStore() == null) return "";
        return job.getStore().getStreetAddress() + ", " + job.getStore().getWard() + ", " + job.getStore().getDistrict() + ", " + job.getStore().getCity();
    }

    default String formatSalaryDetail(JobPost job) {
        if (job.getHourlyWageMin() == null) return "";
        if (job.getHourlyWageMax() != null) {
            return String.format("%,d - %,d %s", job.getHourlyWageMin().intValue(), job.getHourlyWageMax().intValue(), job.getCurrency() != null ? job.getCurrency() : "VND");
        }
        return String.format("%,d %s", job.getHourlyWageMin().intValue(), job.getCurrency() != null ? job.getCurrency() : "VND");
    }

    default List<String> getCategoryNames(JobPost job) {
        if (job.getCategories() == null) return List.of();
        return job.getCategories().stream().map(JobCategory::getCategoryName).collect(Collectors.toList());
    }

    default List<String> getImageUrls(JobPost job) {
        if (job.getImages() == null) return List.of();
        return job.getImages().stream().map(img -> img.getImageUrl()).collect(Collectors.toList());
    }
}
