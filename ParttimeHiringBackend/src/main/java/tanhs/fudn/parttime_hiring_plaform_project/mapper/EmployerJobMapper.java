package tanhs.fudn.parttime_hiring_plaform_project.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer.job.UpdateEmployerJobRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.request.employer.job.CreateEmployerJobRequest;
import tanhs.fudn.parttime_hiring_plaform_project.dto.response.employer.job.*;
import tanhs.fudn.parttime_hiring_plaform_project.entity.application.JobApplication;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPostImage;
import tanhs.fudn.parttime_hiring_plaform_project.entity.review.StoreReview;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

@Mapper(componentModel = "spring")
public interface EmployerJobMapper {

    default String mapDate(LocalDateTime dateTime) {
        if (dateTime == null) return null;
        return dateTime.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
    }

    default String mapDate(LocalDate date) {
        if (date == null) return null;
        return date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
    }

    default String calculateDaysLeft(LocalDateTime expiredAt) {
        if (expiredAt == null) return "Không thời hạn";
        long days = ChronoUnit.DAYS.between(LocalDateTime.now(), expiredAt);
        if (days < 0) return "Đã hết hạn";
        if (days == 0) return "Hết hạn hôm nay";
        return "Còn " + days + " ngày";
    }

    default String formatSalary(java.math.BigDecimal min, java.math.BigDecimal max) {
        if (min == null) return "Thỏa thuận";
        if (max == null || min.compareTo(max) == 0) return min.toString();
        return min + " - " + max;
    }

    default JobStatus computeActualStatus(JobPost jobPost) {
        if (jobPost.getStatus() == JobStatus.EXPIRED) return JobStatus.EXPIRED;
        if (jobPost.getExpiredAt() != null && jobPost.getExpiredAt().isBefore(LocalDateTime.now())) {
            return JobStatus.EXPIRED;
        }
        return jobPost.getStatus();
    }

    default String getFirstShift(JobPost jobPost) {
        if (jobPost.getShifts() == null || jobPost.getShifts().isEmpty()) return "Ca linh hoạt";
        return jobPost.getShifts().get(0).getShiftName();
    }

    @Mapping(target = "id", source = "jobPost.jobPostId")
    @Mapping(target = "store", source = "jobPost.store.storeName")
    @Mapping(target = "address", source = "jobPost.store.streetAddress")
    @Mapping(target = "logo", ignore = true)
    @Mapping(target = "type", source = "jobPost.employmentType")
    @Mapping(target = "salary", expression = "java(formatSalary(jobPost.getHourlyWageMin(), jobPost.getHourlyWageMax()))")
    @Mapping(target = "shift", expression = "java(getFirstShift(jobPost))")
    @Mapping(target = "applicants", source = "applicantsCount")
    @Mapping(target = "posted", expression = "java(mapDate(jobPost.getPublishedAt() != null ? jobPost.getPublishedAt() : jobPost.getCreatedAt()))")
    @Mapping(target = "deadline", expression = "java(mapDate(jobPost.getExpiredAt()))")
    @Mapping(target = "daysLeft", expression = "java(calculateDaysLeft(jobPost.getExpiredAt()))")
    @Mapping(target = "status", expression = "java(computeActualStatus(jobPost))")
    @Mapping(target = "shiftsList", expression = "java(jobPost.getShifts() != null ? jobPost.getShifts().stream().map(s -> s.getShiftName()).collect(java.util.stream.Collectors.toList()) : java.util.Collections.emptyList())")
    @Mapping(target = "categoriesList", expression = "java(jobPost.getCategories() != null ? jobPost.getCategories().stream().map(c -> c.getCategoryName()).collect(java.util.stream.Collectors.toList()) : java.util.Collections.emptyList())")
    EmployerJobListResponse toListResponse(JobPost jobPost, Integer applicantsCount);

    @Mapping(target = "id", source = "jobPost.jobPostId")
    @Mapping(target = "store", source = "jobPost.store.storeName")
    @Mapping(target = "storeId", source = "jobPost.store.storeId")
    @Mapping(target = "address", source = "jobPost.store.streetAddress")
    @Mapping(target = "logo", ignore = true)
    @Mapping(target = "type", source = "jobPost.employmentType")
    @Mapping(target = "description", source = "jobPost.jobDescription")
    @Mapping(target = "salary", expression = "java(formatSalary(jobPost.getHourlyWageMin(), jobPost.getHourlyWageMax()))")
    @Mapping(target = "shift", expression = "java(getFirstShift(jobPost))")
    @Mapping(target = "applicants", source = "applicantsCount")
    @Mapping(target = "deadline", expression = "java(mapDate(jobPost.getExpiredAt()))")
    @Mapping(target = "rawExpiredAt", expression = "java(jobPost.getExpiredAt() != null ? jobPost.getExpiredAt().toLocalDate().toString() : null)")
    @Mapping(target = "daysLeft", expression = "java(calculateDaysLeft(jobPost.getExpiredAt()))")
    @Mapping(target = "posted", expression = "java(mapDate(jobPost.getPublishedAt() != null ? jobPost.getPublishedAt() : jobPost.getCreatedAt()))")
    @Mapping(target = "shiftsList", expression = "java(jobPost.getShifts() != null ? jobPost.getShifts().stream().map(s -> s.getShiftName()).collect(java.util.stream.Collectors.toList()) : java.util.Collections.emptyList())")
    @Mapping(target = "shiftIds", expression = "java(jobPost.getShifts() != null ? jobPost.getShifts().stream().map(s -> s.getShiftId()).collect(java.util.stream.Collectors.toList()) : java.util.Collections.emptyList())")
    @Mapping(target = "categoriesList", expression = "java(jobPost.getCategories() != null ? jobPost.getCategories().stream().map(c -> c.getCategoryName()).collect(java.util.stream.Collectors.toList()) : java.util.Collections.emptyList())")
    @Mapping(target = "categoryIds", expression = "java(jobPost.getCategories() != null ? jobPost.getCategories().stream().map(c -> c.getCategoryId()).collect(java.util.stream.Collectors.toList()) : java.util.Collections.emptyList())")
    EmployerJobDetailResponse toDetailResponse(JobPost jobPost, Integer applicantsCount);

    @Mapping(target = "imageId", source = "imageId")
    @Mapping(target = "imageUrl", source = "imageUrl")
    EmployerJobImageResponse toImageResponse(JobPostImage image);

    @Mapping(target = "reviewerName", source = "review.employmentRecord.user.displayName")
    @Mapping(target = "reviewerAvatar", source = "review.employmentRecord.user.avatarUrl")
    @Mapping(target = "date", expression = "java(mapDate(review.getCreatedAt()))")
    EmployerJobCommentResponse toCommentResponse(StoreReview review);

    @Mapping(target = "userId", source = "application.applicant.id")
    @Mapping(target = "name", source = "application.applicant.displayName")
    @Mapping(target = "avatar", source = "application.applicant.avatarUrl")
    @Mapping(target = "cvUrl", ignore = true)
    @Mapping(target = "email", source = "application.applicant.email")
    @Mapping(target = "phone", source = "application.contactPhone")
    @Mapping(target = "appliedDate", expression = "java(application.getAppliedAt().toLocalDate().format(java.time.format.DateTimeFormatter.ofPattern(\"dd/MM/yyyy\")))")
    @Mapping(target = "appliedTime", expression = "java(application.getAppliedAt().toLocalTime().format(java.time.format.DateTimeFormatter.ofPattern(\"HH:mm\")))")
    @Mapping(target = "note", source = "application.note")
    @Mapping(target = "jobTitle", source = "application.jobPost.title")
    EmployerJobApplicantResponse toApplicantResponse(JobApplication application);

    @Mapping(target = "expiredAt", expression = "java(request.getExpiredAt() != null ? request.getExpiredAt().atTime(23, 59, 59) : null)")
    @Mapping(target = "jobPostId", ignore = true)
    @Mapping(target = "employer", ignore = true)
    @Mapping(target = "store", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "publishedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "shifts", ignore = true)
    @Mapping(target = "categories", ignore = true)
    @Mapping(target = "images", ignore = true)
    JobPost toEntity(CreateEmployerJobRequest request);

    @Mapping(target = "expiredAt", expression = "java(request.getExpiredAt() != null ? request.getExpiredAt().atTime(23, 59, 59) : null)")
    @Mapping(target = "jobPostId", ignore = true)
    @Mapping(target = "employer", ignore = true)
    @Mapping(target = "store", ignore = true)
    @Mapping(target = "status", ignore = true) // Handled in service due to complex rules
    @Mapping(target = "publishedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "shifts", ignore = true)
    @Mapping(target = "categories", ignore = true)
    @Mapping(target = "images", ignore = true)
    void updateEntityFromRequest(UpdateEmployerJobRequest request, @MappingTarget JobPost jobPost);
}
