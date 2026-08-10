package tanhs.fudn.parttime_hiring_plaform_project.configuration;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.Role;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.entity.employer.Employer;
import tanhs.fudn.parttime_hiring_plaform_project.entity.enums.EmployerStatus;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.RoleRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.repository.employer.EmployerRepository;

import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EmployerRepository employerRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 1. Initialize Roles if they don't exist
        Role adminRole = roleRepository.findById("ADMIN").orElseGet(() -> {
            log.info("ADMIN role not found, creating new one...");
            Role role = new Role("ADMIN", "Administrator Role");
            return roleRepository.save(role);
        });
        
        Role employerRole = roleRepository.findById("EMPLOYER").orElseGet(() -> {
            log.info("EMPLOYER role not found, creating new one...");
            Role role = new Role("EMPLOYER", "Employer Role");
            return roleRepository.save(role);
        });

        // 2. Initialize default admin user if it doesn't exist
        if (!userRepository.existsByUsername("admin")) {
            log.info("Admin user not found, creating default admin account...");
            Set<Role> roles = new HashSet<>();
            roles.add(adminRole);
            User adminUser = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin"))
                    .displayName("System Administrator")
                    .email("admin@system.com")
                    .roles(roles)
                    .build();
            userRepository.save(adminUser);
            log.info("Default admin account created successfully! Username: admin | Password: admin");
        }

        // 3. Initialize default employer user if it doesn't exist
        if (!userRepository.existsByUsername("employer")) {
            log.info("Employer user not found, creating default employer account...");
            Set<Role> roles = new HashSet<>();
            roles.add(employerRole);
            User employerUser = User.builder()
                    .username("employer")
                    .password(passwordEncoder.encode("employer"))
                    .displayName("Demo Employer")
                    .email("employer@system.com")
                    .roles(roles)
                    .build();
            employerUser = userRepository.save(employerUser);
            
            // Create Employer profile for this user
            Employer employerProfile = Employer.builder()
                    .userId(employerUser.getId().intValue())
                    .companyName("Demo Company")
                    .emailContact("contact@democompany.com")
                    .phoneContact("0123456789")
                    .status(EmployerStatus.ACTIVE)
                    .build();
            employerRepository.save(employerProfile);
            log.info("Default employer account created successfully! Username: employer | Password: employer");
        }
    }
}
