package com.zora.zora.service;

import com.zora.zora.config.EnvLoader;
import com.zora.zora.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private final PublicKey publicKey;
    private final PrivateKey privateKey;
    private final long accessExpirationTime;
    private final long refreshExpirationTime;

    public JwtService() {
        EnvLoader env = EnvLoader.getInstance();
        this.publicKey = loadPublicKey(env.get("JWT_PUBLIC_KEY_PATH"));
        this.privateKey = loadPrivateKey(env.get("JWT_PRIVATE_KEY_PATH"));
        this.accessExpirationTime = Long.parseLong(env.get("JWT_ACCESS_EXPIRATION_MS"));
        this.refreshExpirationTime = Long.parseLong(env.get("JWT_REFRESH_EXPIRATION_MS"));
    }

    public String generateAccessToken(User user) {
        return buildToken(user, accessExpirationTime, "access");
    }

    public String generateRefreshToken(User user) {
        return buildToken(user, refreshExpirationTime, "refresh");
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(publicKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private String buildToken(User user, long expirationMs, String type) {
        Date now = new Date();
        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(user.getId().toString())
                .claim("username", user.getUsername())
                .claim("type", type)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(privateKey, Jwts.SIG.RS256)
                .compact();
    }

    private PrivateKey loadPrivateKey(String path) {
        try {
            byte[] der = readPem(path);
            return KeyFactory.getInstance("RSA").generatePrivate(new PKCS8EncodedKeySpec(der));
        } catch (Exception e) {
            throw new IllegalStateException("Cannot load private key from file: " + path, e);
        }
    }

    private PublicKey loadPublicKey(String path) {
        try {
            byte[] der = readPem(path);
            return KeyFactory.getInstance("RSA").generatePublic(new X509EncodedKeySpec(der));
        } catch (Exception e) {
            throw new IllegalStateException("Cannot load public key from file: " + path, e);
        }
    }

    private byte[] readPem(String path) throws Exception {
        Resource resource = new DefaultResourceLoader().getResource(path);
        try (InputStream inputStream = resource.getInputStream()) {
            String pem = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8)
                    .replaceAll("-----(BEGIN|END) [A-Z ]+-----", "")
                    .replaceAll("\\s", "");
            return Base64.getDecoder().decode(pem);
        }
    }
}


