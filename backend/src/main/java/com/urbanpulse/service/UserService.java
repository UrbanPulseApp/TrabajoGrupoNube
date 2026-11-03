package com.urbanpulse.service;

import com.urbanpulse.dto.CreateManagedUserRequest;
import com.urbanpulse.dto.RegisterUserRequest;
import com.urbanpulse.dto.UserResponse;
import com.urbanpulse.entity.User;
import com.urbanpulse.enums.Role;
import com.urbanpulse.exception.EmailAlreadyExistsException;
import com.urbanpulse.exception.ResourceNotFoundException;
import com.urbanpulse.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Locale;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse registerCitizen(RegisterUserRequest request) {
        return createAccount(request.getName(), request.getEmail(), request.getPassword(), Role.CITIZEN);
    }

    @Transactional
    public UserResponse createManagedUser(CreateManagedUserRequest request) {
        return createAccount(request.getName(), request.getEmail(), request.getPassword(), request.getRole());
    }

    @Transactional
    public UserResponse createBootstrapAdmin(String email, String password) {
        String normalizedEmail = normalizeEmail(email);
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            User existing = userRepository.findByEmailIgnoreCase(normalizedEmail)
                    .orElseThrow(() -> new IllegalStateException("No se pudo recuperar la cuenta configurada"));
            if (existing.getRole() != Role.ADMIN || !Boolean.TRUE.equals(existing.getActive())) {
                throw new IllegalStateException("El correo de administrador inicial ya pertenece a una cuenta que no es un administrador activo");
            }
            return toResponse(existing);
        }
        return createAccount("Administrador UrbanPulse", normalizedEmail, password, Role.ADMIN);
    }

    @Transactional(readOnly = true)
    public UserResponse findResponseByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(normalizeEmail(email))
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(email))
                .orElseThrow(() -> new UsernameNotFoundException("Credenciales no válidas"));
        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new DisabledException("La cuenta está desactivada");
        }
        if (!StringUtils.hasText(user.getPassword())) {
            throw new DisabledException("La cuenta no tiene una contraseña configurada");
        }
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword(), true, true, true, true,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
    }

    private UserResponse createAccount(String name, String email, String rawPassword, Role role) {
        String normalizedEmail = normalizeEmail(email);
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new EmailAlreadyExistsException(normalizedEmail);
        }
        if (rawPassword == null || rawPassword.length() < 12
                || rawPassword.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 12 caracteres y no superar 72 bytes UTF-8");
        }
        if (role == null) throw new IllegalArgumentException("El rol es obligatorio");

        User user = new User();
        user.setName(name.trim());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setActive(true);
        return toResponse(userRepository.save(user));
    }

    private String normalizeEmail(String email) {
        if (!StringUtils.hasText(email)) throw new IllegalArgumentException("El correo es obligatorio");
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private UserResponse toResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }
}
