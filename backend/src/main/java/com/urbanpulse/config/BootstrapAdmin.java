package com.urbanpulse.config;

import com.urbanpulse.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class BootstrapAdmin implements ApplicationRunner {

    private final UserService userService;
    private final String email;
    private final String password;

    public BootstrapAdmin(UserService userService,
                          @Value("${urbanpulse.bootstrap.admin-email:}") String email,
                          @Value("${urbanpulse.bootstrap.admin-password:}") String password) {
        this.userService = userService;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        boolean hasEmail = StringUtils.hasText(email);
        boolean hasPassword = StringUtils.hasText(password);
        if (!hasEmail && !hasPassword) return;
        if (!hasEmail || !hasPassword) {
            throw new IllegalStateException("Configura juntos URBANPULSE_ADMIN_EMAIL y URBANPULSE_ADMIN_PASSWORD");
        }
        userService.createBootstrapAdmin(email, password);
    }
}
