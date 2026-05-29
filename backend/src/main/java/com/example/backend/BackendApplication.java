package com.example.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.List;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	public CommandLineRunner updateDatabaseSchema(JdbcTemplate jdbcTemplate) {
		return args -> {
			System.out.println("Running database schema updates...");
			
			// 1. Add 'privado' to 'proyecto'
			try {
				jdbcTemplate.execute("ALTER TABLE proyecto ADD COLUMN privado TINYINT(1) DEFAULT 0;");
				System.out.println("Added column 'privado' to table 'proyecto'.");
			} catch (Exception e) {
				System.out.println("Column 'privado' in table 'proyecto' already exists or could not be added.");
			}

			// 2. Add 'rol' to 'asignacion'
			try {
				jdbcTemplate.execute("ALTER TABLE asignacion ADD COLUMN rol VARCHAR(20) DEFAULT 'lector';");
				System.out.println("Added column 'rol' to table 'asignacion'.");
			} catch (Exception e) {
				System.out.println("Column 'rol' in table 'asignacion' already exists or could not be added.");
			}

			// 3. Drop constraint on 'usuario' table check constraint so it can accept 'admin'
			String[] checkConstraints = {"usuario_chk_1", "usuario_chk_2", "usuario_chk_3", "usuario_chk_4", "rol"};
			for (String constraint : checkConstraints) {
				try {
					jdbcTemplate.execute("ALTER TABLE usuario DROP CONSTRAINT " + constraint + ";");
					System.out.println("Dropped constraint '" + constraint + "' from table 'usuario'.");
				} catch (Exception e) {
					// Ignore
				}
				try {
					jdbcTemplate.execute("ALTER TABLE usuario DROP CHECK " + constraint + ";");
					System.out.println("Dropped check constraint '" + constraint + "' from table 'usuario'.");
				} catch (Exception e) {
					// Ignore
				}
			}

			// 4. Drop check constraints on 'asignacion' table so it can accept the new restricted roles
			String[] asignacionConstraints = {"asignacion_chk_1", "asignacion_chk_2", "asignacion_chk_3", "rol"};
			for (String constraint : asignacionConstraints) {
				try {
					jdbcTemplate.execute("ALTER TABLE asignacion DROP CONSTRAINT " + constraint + ";");
					System.out.println("Dropped constraint '" + constraint + "' from table 'asignacion'.");
				} catch (Exception e) {
					// Ignore
				}
				try {
					jdbcTemplate.execute("ALTER TABLE asignacion DROP CHECK " + constraint + ";");
					System.out.println("Dropped check constraint '" + constraint + "' from table 'asignacion'.");
				} catch (Exception e) {
					// Ignore
				}
			}
		};
	}
}
