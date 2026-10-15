package com.oranexus.oranexus.controller;

import org.springframework.stereotype.Controller;
import org.springframework.graphql.data.method.annotation.QueryMapping;

@Controller
public class HelloController {

    @QueryMapping
    public String message() {
        return "Hello World!";
    }
}
