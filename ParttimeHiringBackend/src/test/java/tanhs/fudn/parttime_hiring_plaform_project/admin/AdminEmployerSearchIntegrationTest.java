package tanhs.fudn.parttime_hiring_plaform_project.admin;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.service.admin.AdminEmployerService;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmployerStatus;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest @ActiveProfiles("test") @Transactional
class AdminEmployerSearchIntegrationTest {
    @Autowired AdminEmployerService service;
    @Autowired EmployerRepository employers;
    @Autowired UserRepository users;

    // Keeps login state visible independently from matching company standing.
    @Test
    void filtersCompanyNamesAndMapsIndependentAccountState() {
        var user = users.findByUsername("employer").orElseThrow();
        var employer = employers.findByUserId(user.getId().intValue()).orElseThrow();
        employer.setCompanyName("Admin Search Company");
        employer.setStatus(EmployerStatus.SUSPENDED);
        employers.saveAndFlush(employer);
        var result = service.getAllEmployers(0, 1, "SEARCH COMPANY");
        assertEquals(1, result.getTotalElements());
        assertEquals(EmployerStatus.SUSPENDED, result.getContent().get(0).getStatus());
        assertTrue(result.getContent().get(0).getIsActive());
        assertTrue(service.getAllEmployers(0, 10, "missing-company").isEmpty());
    }
}
