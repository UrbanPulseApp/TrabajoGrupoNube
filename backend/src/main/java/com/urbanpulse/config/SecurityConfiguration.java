package com.urbanpulse.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.urbanpulse.dto.ApiError;
import com.urbanpulse.service.UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.session.ChangeSessionIdAuthenticationStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

    private final UserService userService;
    private final ObjectMapper objectMapper;
    private final PasswordEncoder passwordEncoder;

    public SecurityConfiguration(UserService userService, ObjectMapper objectMapper, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.objectMapper = objectMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    public SessionAuthenticationStrategy sessionAuthenticationStrategy() {
        return new ChangeSessionIdAuthenticationStrategy();
    }

    @Bean
    public AuthenticationEntryPoint apiAuthenticationEntryPoint() {
        return (request, response, exception) -> writeSecurityError(request, response, HttpStatus.UNAUTHORIZED,
                "UNAUTHENTICATED", "Authentication required", "Inicia sesión para continuar.");
    }

    @Bean
    public AccessDeniedHandler apiAccessDeniedHandler() {
        return (request, response, exception) -> writeSecurityError(request, response, HttpStatus.FORBIDDEN,
                "FORBIDDEN", "Insufficient permissions", "Tu cuenta no tiene permiso para esta operación.");
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userService).passwordEncoder(passwordEncoder);
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        CookieCsrfTokenRepository csrfRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        csrfRepository.setHeaderName("X-XSRF-TOKEN");

        http
                .csrf()
                .csrfTokenRepository(csrfRepository)
                .ignoringAntMatchers("/api/auth/login", "/api/auth/logout")
                .and()
                .securityContext()
                .securityContextRepository(securityContextRepository())
                .and()
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .and()
                .authorizeRequests()
                .antMatchers("/api/auth/csrf", "/api/auth/login", "/api/users/**").permitAll()
                .antMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .antMatchers(HttpMethod.GET, "/api/incidents", "/api/incidents/*",
                        "/api/incidents/*/status-changes",
                        "/api/incidents/*/attachments", "/api/incidents/*/attachments/*").permitAll()
                .antMatchers(HttpMethod.POST, "/api/incidents").hasAnyAuthority("CITIZEN", "OPERATOR", "ADMIN")
                .antMatchers(HttpMethod.POST, "/api/incidents/*/attachments").hasAnyAuthority("CITIZEN", "OPERATOR", "ADMIN")
                .antMatchers(HttpMethod.PATCH, "/api/incidents/*").hasAnyAuthority("OPERATOR", "ADMIN")
                .antMatchers(HttpMethod.POST, "/api/incidents/*/assignments").hasAnyAuthority("OPERATOR", "ADMIN")
                .antMatchers(HttpMethod.GET, "/api/incidents/*/assignments").hasAnyAuthority("OPERATOR", "TECHNICIAN", "ADMIN")
                .antMatchers(HttpMethod.PATCH, "/api/incidents/*/assignments/*").hasAnyAuthority("OPERATOR", "ADMIN")
                .antMatchers("/api/admin/**").hasAuthority("ADMIN")
                .antMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
                .and()
                .exceptionHandling()
                .authenticationEntryPoint(apiAuthenticationEntryPoint())
                .accessDeniedHandler(apiAccessDeniedHandler())
                .and()
                .logout()
                .logoutUrl("/api/auth/logout")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .deleteCookies("JSESSIONID", "XSRF-TOKEN")
                .logoutSuccessHandler((request, response, authentication) -> response.setStatus(HttpServletResponse.SC_NO_CONTENT));
    }

    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }

    private void writeSecurityError(javax.servlet.http.HttpServletRequest request,
                                    HttpServletResponse response, HttpStatus status,
                                    String code, String title, String detail) throws IOException {
        String requestId = UUID.randomUUID().toString();
        ApiError error = new ApiError();
        error.setType("https://api.urbanpulse.com/problems/" + code.toLowerCase());
        error.setTitle(title);
        error.setStatus(status.value());
        error.setCode(code);
        error.setDetail(detail);
        error.setInstance(request.getRequestURI());
        error.setRequestId(requestId);
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader("X-Request-ID", requestId);
        objectMapper.writeValue(response.getOutputStream(), error);
    }
}