package com.example.backend.controllers;

import com.example.backend.dto.ModalidadDTO;
import com.example.backend.services.ModalidadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping
    public ResponseEntity<ModalidadDTO> crear(@RequestBody ModalidadDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(modalidadService.crear(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        modalidadService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}