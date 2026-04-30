package com.sliit.paf.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;

@Component
@RequiredArgsConstructor
public class NotificationSchemaInitializer implements CommandLineRunner {

    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try (Connection connection = dataSource.getConnection()) {
            addColumnIfMissing(connection, "is_read", "ALTER TABLE notifications ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT FALSE");
            addColumnIfMissing(connection, "read", "ALTER TABLE notifications ADD COLUMN `read` BOOLEAN NOT NULL DEFAULT FALSE");
        }
    }

    private void addColumnIfMissing(Connection connection, String columnName, String statement) throws Exception {
        try (ResultSet columns = connection.getMetaData().getColumns(
                connection.getCatalog(),
                null,
                "notifications",
                columnName
        )) {
            if (!columns.next()) {
                jdbcTemplate.execute(statement);
            }
        }
    }
}
