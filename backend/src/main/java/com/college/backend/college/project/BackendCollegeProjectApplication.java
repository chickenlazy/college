package com.college.backend.college.project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BackendCollegeProjectApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendCollegeProjectApplication.class, args);
	}

}
