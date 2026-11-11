package com.oranexus.oranexus.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Bean
    public DataSource dataSource() {
        EnvLoader env = EnvLoader.getInstance();

        String url = "jdbc:postgresql://" + env.get("SUPABASE_HOST")
                + ":" + env.get("SUPABASE_PORT")
                + "/" + env.get("SUPABASE_DATABASE")
                + "?sslmode=require";

        HikariConfig config = new HikariConfig();
        config.setDriverClassName("org.postgresql.Driver");
        config.setJdbcUrl(url);
        config.setUsername(env.get("SUPABASE_USERNAME"));
        config.setPassword(env.get("SUPABASE_PASSWORD"));
        config.setMaximumPoolSize(5);

        return new HikariDataSource(config);
    }
}