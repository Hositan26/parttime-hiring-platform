package tanhs.fudn.parttime_hiring_plaform_project;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
public class BcryptTest {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        boolean matches = encoder.matches("admin", "$2a$10$c62K8ht1lo2NLtT/5Ks/Y.DvbC2JYo0zlaJA2qTsdMkZQiTx441Qa");
        System.out.println("Matches: " + matches);
    }
}
