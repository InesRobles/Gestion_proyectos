package com.example.backend.controllers;

import com.example.backend.dto.ModalidadesDTO;
import com.example.backend.services.ModalidadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/modalidad")
public class ModalidadController {

    @Autowired
    private ModalidadService modalidadesService;

    @GetMapping
    public List<ModalidadesDTO> findAll() {
        return modalidadesService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ModalidadesDTO> findById(@PathVariable Long id) {
        return modalidadesService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}