package com.sliit.paf.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTicketRequest {

    @NotNull(message = "Resource ID is required")
    private Long resourceId;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Priority is required")
    private String priority;

    @NotBlank(message = "Preferred contact is required")
    private String preferredContact;

    @NotNull(message = "Created by user ID is required")
    private Long createdBy;
}
