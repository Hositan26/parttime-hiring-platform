package tanhs.fudn.parttime_hiring_plaform_project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ParttimeHiringPlaformProjectApplication {

    public static void main(String[] args) {
        SpringApplication.run(ParttimeHiringPlaformProjectApplication.class, args);
    }

}
