package com.mycompany.backend.service;

import com.mycompany.backend.dao.UserDao;
import com.mycompany.backend.dto.LoginRequestDto;
import com.mycompany.backend.dto.LoginResponseDto;
import com.mycompany.backend.dto.UserRegisterDto;
import com.mycompany.backend.dto.UserResponseDto;
import com.mycompany.backend.enums.Role;
import com.mycompany.backend.model.User;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@ApplicationScoped
public class AuthService {

    @Inject
    private UserDao userDao;

    public LoginResponseDto authenticate(LoginRequestDto dto) {
        User user = userDao.findByEmail(dto.getEmail());
        if (user == null) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String hashedPassword = hashPassword(dto.getPassword());
        if (!user.getPasswordHash().equals(hashedPassword)) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return new LoginResponseDto(user.getId(), user.getName(), user.getEmail(), user.getRole(), "Login successful");
    }

    @Transactional
    public UserResponseDto registerUser(UserRegisterDto dto) {
        if (userDao.findByEmail(dto.getEmail()) != null) {
            throw new IllegalArgumentException("User with this email already exists");
        }

        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPasswordHash(hashPassword(dto.getPassword()));

        // Default to staff if role is missing
        user.setRole(Role.staff);

        // 1. Persist the user (create returns void)
        userDao.create(user);

        // 2. Return the DTO (user.getId() is populated automatically after persist)
        return new UserResponseDto(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }

    public String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }
}
