package tanhs.fudn.parttime_hiring_plaform_project.repository.employer;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import java.util.Optional;
import java.time.LocalDateTime;

public interface EmployerRepository extends JpaRepository<Employer, Integer> {
    // Searches company names before applying administration pagination.
    Page<Employer> findByCompanyNameContainingIgnoreCase(String query, Pageable pageable);
    Optional<Employer> findByUserId(Integer userId);
    boolean existsByUserId(Integer userId);

    long countByCreatedAtAfter(LocalDateTime date);
}
