package tanhs.fudn.parttime_hiring_plaform_project.repository.employer;

import org.springframework.data.jpa.repository.JpaRepository;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import java.util.Optional;

public interface EmployerRepository extends JpaRepository<Employer, Integer> {
    Optional<Employer> findByUserId(Integer userId);
}
