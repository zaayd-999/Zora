package com.zora.zora.config;

public final class MailConfig {

    private final String host;
    private final int port;
    private final String username;
    private final String password;
    private final String from;

    private MailConfig() {
        EnvLoader env = EnvLoader.getInstance();
        this.host = env.get("MAIL_HOST");
        this.port = Integer.parseInt(env.get("MAIL_PORT"));
        this.username = env.get("MAIL_USERNAME");
        this.password = env.get("MAIL_PASSWORD");
        this.from = env.get("MAIL_FROM");
    }

    private static class Holder {
        private static final MailConfig INSTANCE = new MailConfig();
    }

    public static MailConfig getInstance() {
        return Holder.INSTANCE;
    }

    public String getHost() { return host; }
    public int getPort() { return port; }
    public String getUsername() { return username; }
    public String getPassword() { return password; }
    public String getFrom() { return from; }
}