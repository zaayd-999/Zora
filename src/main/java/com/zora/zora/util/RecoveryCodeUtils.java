package com.zora.zora.util;


import java.security.SecureRandom;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

public class RecoveryCodeUtils {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public static String generateCode(int length) {
        if (length < 1 || length > 18) {
            throw new IllegalArgumentException(
                    "Length must be between 1 and 18"
            );
        }

        long bound = (long) Math.pow(10, length);

        long number = SECURE_RANDOM.nextLong(bound);

        return "0".repeat(length - Long.toString(number).length()) + number;
    }

    public static String generateCode() {
        return generateCode(6);
    }

    public static String hashCode(String code) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    code.getBytes(StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(hash);

        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is unavailable", e);
        }
    }

    public static boolean verifyCode(String input, String storedHash) {
        if (input == null || storedHash == null) {
            return false;
        }

        String inputHash = hashCode(input);

        return MessageDigest.isEqual(
                inputHash.getBytes(StandardCharsets.UTF_8),
                storedHash.getBytes(StandardCharsets.UTF_8)
        );
    }
}
