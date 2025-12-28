package com.shopfy.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class SchemaFixConfig {

    @Bean
    public CommandLineRunner fixSchema(JdbcTemplate jdbcTemplate) {
        return args -> {
            System.out.println("Running Schema Fix...");
            try {
                // Option 1: Convert to VARCHAR to avoid Enum headaches forever
                // jdbcTemplate.execute("ALTER TABLE orders MODIFY COLUMN status VARCHAR(50)");

                // Option 2: Update Enum (Safer for keeping data if matched, but VARCHAR is
                // safer generally)
                jdbcTemplate.execute("ALTER TABLE orders MODIFY COLUMN status VARCHAR(50)");

                System.out.println("Schema Fix Executed Successfully: status column changed to VARCHAR(50)");
            } catch (Exception e) {
                System.out.println("Schema Fix Failed (might already be fixed): " + e.getMessage());
            }
        };
    }
}
