package com.sliit.paf.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTicketRequest {

    @NotBlank
    @Size(min = 3, max = 100)
    private String category;

    @NotBlank
    @Size(min = 10, max = 500)
    private String description;

    @NotNull
    private Long resourceId;

    @NotBlank
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL

    @NotBlank
    private String preferredContact;

    @NotNull
    private Long createdBy; // User ID
}
