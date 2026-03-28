package com.cardoptimizer.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.sql.DataSource;
import java.sql.Connection;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration test: confirms Spring Boot loads with SQLite datasource and
 * that a JDBC connection to the SQLite database can be obtained.
 * This is the RED test for Task 1 — fails before pom.xml / yml changes.
 */
@SpringBootTest
class DataSourceIT {

    @Autowired
    private DataSource dataSource;

    @Test
    void dataSource_connectsToSQLite() throws Exception {
        try (Connection conn = dataSource.getConnection()) {
            assertThat(conn.isValid(2)).isTrue();
            String url = conn.getMetaData().getURL();
            assertThat(url).contains("sqlite");
        }
    }
}
