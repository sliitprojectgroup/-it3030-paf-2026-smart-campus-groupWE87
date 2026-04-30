package com.sliit.paf.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record NotificationRequest(
        @NotNull Long userId,
        String title,
        @NotBlank String message,
        String type,
        Long referenceId,
        String referenceType
) {
}
