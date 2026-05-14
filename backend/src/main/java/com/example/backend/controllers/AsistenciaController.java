package com.example.backend.controllers;

import com.example.backend.dto.AsistenciaDTO;
import com.example.backend.services.AsistenciaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/asistencia")
public class AsistenciaController {

    @Autowired
    private AsistenciaService asistenciaService;

    @GetMapping
    public List<AsistenciaDTO> findAll() {
        return asistenciaService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AsistenciaDTO> findById(@PathVariable Long id) {
        return asistenciaService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}