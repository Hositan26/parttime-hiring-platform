package tanhs.fudn.parttime_hiring_plaform_project;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employment.EmploymentRecord;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employment.EmploymentRecordRepository;

import java.util.List;

@SpringBootTest
@ActiveProfiles("dev")
public class DebugDataTest {

    @Autowired
    private EmploymentRecordRepository repository;

    @Test
    public void testFindByEmployerId() {
        System.out.println("====== START DEBUGGING EMPLOYER ID 1 ======");
        try {
            List<EmploymentRecord> records = repository.findByEmployerIdWithDetails(1);
            System.out.println("TOTAL RECORDS FOUND FOR EMPLOYER_ID 1: " + records.size());
            
            for (EmploymentRecord record : records) {
                System.out.println("-------------------------------------");
                System.out.println("Record ID: " + record.getEmploymentRecordId());
                System.out.println("Status: " + record.getWorkStatus());
                System.out.println("Store ID: " + record.getStore().getStoreId());
                System.out.println("Store Name: " + record.getStore().getStoreName());
                if (record.getUser() != null) {
                    System.out.println("Employee ID: " + record.getUser().getId());
                } else {
                    System.out.println("Employee: NULL");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        System.out.println("====== END DEBUGGING ======");
    }

    @Autowired
    private tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository employerRepository;

    @Autowired
    private tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository userRepository;

    @Test
    public void testCheckUsers() {
        System.out.println("====== START DEBUGGING USERS ======");
        try {
            List<tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User> users = userRepository.findAll();
            for (tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User u : users) {
                System.out.println("User ID: " + u.getId());
                System.out.println("Username: " + u.getUsername());
                System.out.println("Email: " + u.getEmail());
                System.out.println("-------------------------------------");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        System.out.println("====== END DEBUGGING USERS ======");
    }
}
