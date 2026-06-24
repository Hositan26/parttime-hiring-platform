package tanhs.fudn.parttime_hiring_plaform_project.repository.employment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employment.EmploymentRecord;

import java.util.List;

@Repository
public interface EmploymentRecordRepository extends JpaRepository<EmploymentRecord, Integer> {
    
    @Query("SELECT er FROM EmploymentRecord er JOIN FETCH er.user JOIN FETCH er.jobPost WHERE er.store.storeId = :storeId ORDER BY er.createdAt DESC")
    List<EmploymentRecord> findByStoreIdWithDetails(@Param("storeId") Integer storeId);

}
