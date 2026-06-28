package tanhs.fudn.parttime_hiring_plaform_project.repository.employment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employment.EmploymentRecord;
import tanhs.fudn.parttime_hiring_plaform_project.entity.application.JobApplication;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmploymentRecordRepository extends JpaRepository<EmploymentRecord, Integer> {

    Optional<EmploymentRecord> findByApplication(JobApplication application);

    @Query("SELECT er FROM EmploymentRecord er LEFT JOIN FETCH er.user LEFT JOIN FETCH er.jobPost LEFT JOIN FETCH er.application LEFT JOIN FETCH er.store WHERE er.store.storeId = :storeId ORDER BY er.createdAt DESC")
    List<EmploymentRecord> findByStoreIdWithDetails(@Param("storeId") Integer storeId);

    @Query("SELECT er FROM EmploymentRecord er LEFT JOIN FETCH er.user LEFT JOIN FETCH er.jobPost LEFT JOIN FETCH er.application LEFT JOIN FETCH er.store WHERE er.store.employer.employerId = :employerId ORDER BY er.createdAt DESC")
    List<EmploymentRecord> findByEmployerIdWithDetails(@Param("employerId") Integer employerId);

}
