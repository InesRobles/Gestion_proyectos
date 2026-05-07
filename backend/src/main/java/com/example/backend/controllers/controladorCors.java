package com.example.backend.controllers;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:8100")
@RestController
@RequestMapping("/api")
public class controladorCors {

    @GetMapping("/datos")
    public String obtenerDatos() {
        return "Hola desde Spring Boot";
    }
}