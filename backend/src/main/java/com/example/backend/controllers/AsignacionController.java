package com.example.backend.controllers;

import com.example.backend.dto.AsignacionDTO;
import com.example.backend.models.AsignacionId;
import com.example.backend.services.AsignacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/asignacion")
public class AsignacionController {

    @Autowired
    private AsignacionService asignacionService;

    @GetMapping
    public List<AsignacionDTO> findAll() {
        return asignacionService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AsignacionDTO> findById(@PathVariable AsignacionId id) {
        return asignacionService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}