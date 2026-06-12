package tanhs.fudn.parttime_hiring_plaform_project.repository.employer;

import org.springframework.data.jpa.repository.JpaRepository;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Store;

public interface StoreRepository extends JpaRepository<Store, Integer> {
    long countByEmployer_EmployerId(Integer employerId);
    java.util.List<Store> findByEmployer_EmployerId(Integer employerId);
}
