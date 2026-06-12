package tanhs.fudn.parttime_hiring_plaform_project.controller.employer;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import tanhs.fudn.parttime_hiring_plaform_project.entity.identity.User;
import tanhs.fudn.parttime_hiring_plaform_project.repository.identity.UserRepository;
import tanhs.fudn.parttime_hiring_plaform_project.service.employer.EmployerStoreService;

@RestController
@RequestMapping("/api/v1/employer/stores")
public class EmployerStoreController {

    private final EmployerStoreService employerStoreService;
    private final UserRepository userRepository;

    public EmployerStoreController(EmployerStoreService employerStoreService, UserRepository userRepository) {
        this.employerStoreService = employerStoreService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<?> getStores(Authentication authentication,
                                       @RequestParam(defaultValue = "newest") String sortBy) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(employerStoreService.getEmployerStores(user.getId().intValue(), sortBy));
    }
}
