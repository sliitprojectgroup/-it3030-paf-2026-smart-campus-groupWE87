package com.sliit.paf;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class PafApplication {

	public static void main(String[] args) {
		SpringApplication.run(PafApplication.class, args);
	}

}
