package tanhs.fudn.parttime_hiring_plaform_project.repository.job;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Store;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobCategory;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobPost;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.WorkShift;

import java.math.BigDecimal;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmployerStatus;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.JobStatus;

public class JobPostSpecification {
    // Applies public visibility rules before optional recruitment filters.
    public static Specification<JobPost> filterJobs(
            String title, String storeName, Integer categoryId, Integer shiftId,
            BigDecimal minWage, BigDecimal maxWage,
            String city, String district, String ward, String streetAddress
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Always filter out expired jobs
            predicates.add(criteriaBuilder.or(
                    criteriaBuilder.isNull(root.get("expiredAt")),
                    criteriaBuilder.greaterThan(root.get("expiredAt"), LocalDateTime.now())
            ));

            // Status should be ACTIVE
            predicates.add(criteriaBuilder.equal(root.get("status"), JobStatus.ACTIVE));
            predicates.add(criteriaBuilder.or(criteriaBuilder.isNull(root.get("publishedAt")),
                    criteriaBuilder.lessThanOrEqualTo(root.get("publishedAt"), LocalDateTime.now())));
            predicates.add(criteriaBuilder.equal(root.get("employer").get("status"), EmployerStatus.ACTIVE));

            // Title
            if (StringUtils.hasText(title)) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), "%" + title.toLowerCase() + "%"));
            }

            // Store info
            Join<JobPost, Store> storeJoin = root.join("store", JoinType.INNER);
            predicates.add(criteriaBuilder.isTrue(storeJoin.get("isActive")));
            predicates.add(criteriaBuilder.isTrue(storeJoin.get("isApproved")));
            query.distinct(true);

            if (StringUtils.hasText(storeName)) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(storeJoin.get("storeName")), "%" + storeName.toLowerCase() + "%"));
            }

            if (StringUtils.hasText(city)) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(storeJoin.get("city")), "%" + city.toLowerCase() + "%"));
            }

            if (StringUtils.hasText(district)) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(storeJoin.get("district")), "%" + district.toLowerCase() + "%"));
            }

            if (StringUtils.hasText(ward)) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(storeJoin.get("ward")), "%" + ward.toLowerCase() + "%"));
            }

            if (StringUtils.hasText(streetAddress)) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(storeJoin.get("streetAddress")), "%" + streetAddress.toLowerCase() + "%"));
            }

            // Wage
            if (minWage != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("hourlyWageMin"), minWage));
            }

            if (maxWage != null) {
                // If the user wants maxWage filter, it should ideally check if the job's max wage is <= the user's max wage
                // Or maybe check if min wage is <= user's max wage
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("hourlyWageMin"), maxWage));
            }

            // Category
            if (categoryId != null) {
                Join<JobPost, JobCategory> categoryJoin = root.join("categories", JoinType.INNER);
                predicates.add(criteriaBuilder.equal(categoryJoin.get("categoryId"), categoryId));
            }

            // Shift
            if (shiftId != null) {
                Join<JobPost, WorkShift> shiftJoin = root.join("shifts", JoinType.INNER);
                predicates.add(criteriaBuilder.equal(shiftJoin.get("shiftId"), shiftId));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    // Restricts title matches to jobs owned by the selected employer.
    public static Specification<JobPost> filterEmployerJobs(Integer employerId, Integer storeId, JobStatus status, String keyword) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.equal(root.get("employer").get("employerId"), employerId));

            if (storeId != null) {
                predicates.add(criteriaBuilder.equal(root.get("store").get("storeId"), storeId));
            }

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            if (keyword != null && !keyword.isBlank()) {
                String term = keyword.strip().toLowerCase(java.util.Locale.ROOT)
                        .replace("!", "!!").replace("%", "!%").replace("_", "!_");
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), "%" + term + "%", '!'));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
