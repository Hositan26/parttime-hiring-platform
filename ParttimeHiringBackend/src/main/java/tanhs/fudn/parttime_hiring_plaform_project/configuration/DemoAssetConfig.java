package tanhs.fudn.parttime_hiring_plaform_project.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.nio.file.Path;

@Configuration
@Profile("dev & !prod & !test")
public class DemoAssetConfig implements WebMvcConfigurer {
    private final Path images;

    // Restricts public demo resources to the image directory only.
    public DemoAssetConfig(@Value("${app.demo.assets-directory}") String assetsDirectory) {
        images = Path.of(assetsDirectory).toAbsolutePath().normalize().resolve("images");
    }

    // Serves demo images without exposing sibling private resume files.
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/demo/**").addResourceLocations(images.toUri().toString() + "/");
    }
}
