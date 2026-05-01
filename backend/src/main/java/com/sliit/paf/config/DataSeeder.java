package com.sliit.paf.config;

import com.sliit.paf.model.User;
import com.sliit.paf.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository) {
        return args -> {
            List<User> demoUsers = List.of(
                new User(null, "Deshan Perera", "deshan@sliit.lk", "123", "USER"),
                new User(null, "Nadeesha Silva", "nadeesha@sliit.lk", "123", "USER"),
                new User(null, "Kasun Fernando", "kasun@sliit.lk", "123", "USER"),
                new User(null, "Tharindu Jayasinghe", "tharindu@sliit.lk", "123", "USER"),
                new User(null, "Sanduni Wickramasinghe", "sanduni@sliit.lk", "123", "USER"),
                new User(null, "Ravindu Gunawardena", "ravindu@sliit.lk", "123", "USER"),
                new User(null, "Nimesh Alwis", "nimesh@sliit.lk", "123", "ADMIN"),
                new User(null, "Shwetha Fernando", "shwetha@sliit.lk", "123", "ADMIN"),
                new User(null, "Oshani Silva", "oshani@sliit.lk", "123", "ADMIN"),
                new User(null, "Kulitha Jayawardena", "kulitha@sliit.lk", "123", "ADMIN")
            );

            for (User demoUser : demoUsers) {
                userRepository.findByEmail(demoUser.getEmail())
                        .map(existingUser -> {
                            existingUser.setName(demoUser.getName());
                            existingUser.setPassword(demoUser.getPassword());
                            existingUser.setRole(demoUser.getRole());
                            return userRepository.save(existingUser);
                        })
                        .orElseGet(() -> userRepository.save(demoUser));
            }
        };
    }
}
