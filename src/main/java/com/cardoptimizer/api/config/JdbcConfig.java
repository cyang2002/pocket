package com.cardoptimizer.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.relational.core.dialect.AnsiDialect;
import org.springframework.data.relational.core.dialect.Dialect;

/**
 * Registers the ANSI SQL dialect for Spring Data JDBC.
 * SQLite is not natively supported by Spring Data JDBC's dialect detection,
 * so we provide AnsiDialect explicitly to prevent startup failure.
 */
@Configuration
public class JdbcConfig {

    @Bean
    public Dialect jdbcDialect() {
        return AnsiDialect.INSTANCE;
    }
}
