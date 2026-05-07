package com.example.backend.controllers;

import com.example.backend.dto.AsignacionesDTO;
import com.example.backend.models.AsignacionesId;
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
    private AsignacionService asignacionesService;

    @GetMapping
    public List<AsignacionesDTO> findAll() {
        return asignacionesService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AsignacionesDTO> findById(@PathVariable AsignacionesId id) {
        return asignacionesService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}