package com.sliit.paf.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotBlank
    private String name;

    @Column(nullable = false, unique = true)
    @NotBlank
    @Email
    private String email;

    @Column(nullable = false)
    @NotBlank
    private String password;

    @Column(nullable = false)
    @NotBlank
    private String role; // USER or ADMIN
}
