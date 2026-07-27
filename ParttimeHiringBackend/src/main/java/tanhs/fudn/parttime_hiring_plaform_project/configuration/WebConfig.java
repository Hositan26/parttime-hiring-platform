package tanhs.fudn.parttime_hiring_plaform_project.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.HandlerTypePredicate;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        configurer.addPathPrefix("/api/employer", 
            HandlerTypePredicate.forBasePackage("tanhs.fudn.parttime_hiring_plaform_project.controller.employer"));
    }
}
