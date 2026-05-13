package com.example.backend.controllers;

import com.example.backend.dto.ModalidadDTO;
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
    private ModalidadService modalidadService;

    @GetMapping
    public List<ModalidadDTO> findAll() {
        return modalidadService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ModalidadDTO> findById(@PathVariable Long id) {
        return modalidadService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}