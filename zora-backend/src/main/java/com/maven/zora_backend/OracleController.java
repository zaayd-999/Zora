package com.example.zora_backend;

import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

@Controller
public class OracleController {

    @QueryMapping
    public String hello() {
        return "OraNexus backend is running";
    }
}