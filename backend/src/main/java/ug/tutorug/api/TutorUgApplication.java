package ug.tutorug.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class TutorUgApplication {

    public static void main(String[] args) {
        SpringApplication.run(TutorUgApplication.class, args);
    }
}
