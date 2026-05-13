package com.sliit.paf.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketAttachmentResponse {

    private Long id;
    private String fileName;
    private String filePath;
    private String fileType;
    private Long fileSize;
}
