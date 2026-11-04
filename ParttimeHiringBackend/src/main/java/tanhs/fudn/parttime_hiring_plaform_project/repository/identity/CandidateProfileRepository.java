package tanhs.fudn.parttime_hiring_plaform_project.repository.identity;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.CandidateProfile;

public interface CandidateProfileRepository extends JpaRepository<CandidateProfile, Long> {
    // Finds candidate documents by their authenticated owner's immutable identifier.
    Optional<CandidateProfile> findByUser_Id(Long userId);
}
