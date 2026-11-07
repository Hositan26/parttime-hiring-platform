package tanhs.fudn.parttime_hiring_plaform_project.repository.job;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tanhs.fudn.parttime_hiring_plaform_project.entity.job.JobCategory;

@Repository
public interface JobCategoryRepository extends JpaRepository<JobCategory, Integer> {
    // Finds matching category names before pagination.
    Page<JobCategory> findByCategoryNameContainingIgnoreCase(String query, Pageable pageable);
    // Finds case-insensitive name conflicts during catalog edits.
    java.util.Optional<JobCategory> findByCategoryNameIgnoreCase(String name);
    // Finds normalized slug collisions before catalog persistence.
    java.util.Optional<JobCategory> findBySlug(String slug);
}

