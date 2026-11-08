package tanhs.fudn.parttime_hiring_plaform_project.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Cấu hình bảo mật chính của Spring Security.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final SecurityErrorWriter errors;
    private final AuthRateLimitFilter rateLimitFilter;
    private final EmployerStatusFilter employerStatusFilter;
    @Value("${app.auth.cookie-secure:true}")
    private boolean cookieSecure;
    @Value("${app.demo.public-images:false}")
    private boolean publicDemoImages;
    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String[] allowedOrigins;
    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;

    // Wires authentication filters, public errors, and Google sign-in handlers.
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, SecurityErrorWriter errors, AuthRateLimitFilter rateLimitFilter, EmployerStatusFilter employerStatusFilter,
                          CustomOAuth2UserService customOAuth2UserService,
                          OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.errors = errors;
        this.rateLimitFilter = rateLimitFilter;
        this.employerStatusFilter = employerStatusFilter;
        this.customOAuth2UserService = customOAuth2UserService;
        this.oAuth2AuthenticationSuccessHandler = oAuth2AuthenticationSuccessHandler;
    }

    /**
     * Cấu hình mã hoá mật khẩu sử dụng thuật toán BCrypt.
     */
    // Provides adaptive password hashing for account credentials.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Xuất AuthenticationManager để sử dụng trong AuthService.
     */
    // Exposes Spring Security credential authentication to the account service.
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    /**
     * Cấu hình luồng bảo mật (Security Filter Chain).
     */
    // Applies CSRF, cookie authentication, and role restrictions to API requests.
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        var csrfRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        csrfRepository.setCookieCustomizer(cookie -> cookie.path("/").secure(cookieSecure).sameSite("Lax"));
        http
            .exceptionHandling(handler -> handler
                .authenticationEntryPoint((request, response, failure) -> errors.write(response, 401, "UNAUTHORIZED", "Authentication is required"))
                .accessDeniedHandler((request, response, failure) -> errors.write(response, 403, "FORBIDDEN", "Permission denied")))
            .requestCache(cache -> cache.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.csrfTokenRepository(csrfRepository).csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/demo/**").access((authentication, context) -> new AuthorizationDecision(publicDemoImages))
                .requestMatchers("/api/auth/csrf", "/api/auth/register", "/api/auth/login", "/api/auth/logout", "/api/auth/refresh", "/api/auth/forgot-password", "/api/auth/reset-password", "/oauth2/**", "/login/oauth2/**", "/api/jobs/**", "/error").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/employer/**").hasRole("EMPLOYER")
                .requestMatchers("/api/users/applications/**").hasRole("USER")
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                        .userService(customOAuth2UserService)
                )
                .failureHandler((request, response, failure) -> response.sendRedirect(frontendUrl + "/login?error=oauth_failed"))
                .successHandler(oAuth2AuthenticationSuccessHandler)
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(rateLimitFilter, JwtAuthenticationFilter.class)
            .addFilterAfter(employerStatusFilter, JwtAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    // Allows credentialed browser requests only from configured frontend origins.
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(allowedOrigins));
        configuration.setAllowCredentials(true);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("Content-Type", "Accept", "X-XSRF-TOKEN"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

