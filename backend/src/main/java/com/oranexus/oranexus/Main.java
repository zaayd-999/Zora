package com.oranexus.oranexus;
import com.oranexus.oranexus.config.EnvLoader;
public class Main {
    public static void main(String[] args) {
        EnvLoader envLoader = EnvLoader.getInstance();
        System.out.println(envLoader.get("APPLICATION_PORT"));
    }
}
