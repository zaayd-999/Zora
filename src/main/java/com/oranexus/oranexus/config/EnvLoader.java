package com.oranexus.oranexus.config;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public final class EnvLoader {

    private final Map<String, String> variables = new HashMap<>();

    private EnvLoader() {
        try (InputStream in = getClass().getClassLoader().getResourceAsStream(".env")) {
            if (in == null) {
                throw new IllegalStateException(".env file not found in resources");
            }
            BufferedReader reader = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8));
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) {
                    continue;
                }
                int index = line.indexOf('=');
                variables.put(line.substring(0, index).trim(), line.substring(index + 1).trim());
            }
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private static class Holder {
        private static final EnvLoader INSTANCE = new EnvLoader();
    }

    public static EnvLoader getInstance() {
        return Holder.INSTANCE;
    }

    public String get(String key) {
        String value = variables.get(key);
        if (value == null) {
            throw new IllegalArgumentException("Missing variable in .env: " + key);
        }
        return value;
    }
}