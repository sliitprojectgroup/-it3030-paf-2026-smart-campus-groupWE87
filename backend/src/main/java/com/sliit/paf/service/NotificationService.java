package com.sliit.paf.service;

import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    public void sendNotification(String message) {
        // Simple console output for notifications as per requirements
        System.out.println("===============================");
        System.out.println("NOTIFICATION: " + message);
        System.out.println("===============================");
    }
}
