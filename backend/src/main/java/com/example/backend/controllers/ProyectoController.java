package com.example.backend.controllers;

import com.example.backend.dto.ProyectoDTO;
import com.example.backend.services.ProyectoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/proyecto")
public class ProyectoController {

    @Autowired
    private ProyectoService proyectoService;

    @GetMapping
    public List<ProyectoDTO> findAll() {
        return proyectoService.findAll();
    }

    @GetMapping("/{id}")
    public Optional<ProyectoDTO> findById(@PathVariable Long id) {
        return proyectoService.findById(id);
    }
}
