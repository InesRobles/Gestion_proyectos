package com.example.backend.controllers;

import com.example.backend.dto.ProyectoDTO;
import com.example.backend.services.ProyectoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/proyecto")
public class ProyectoController {

    @Autowired
    private ProyectoService proyectoService;

    // ─── READ ────────────────────────────────────────────────────────────────

    @GetMapping
    public List<ProyectoDTO> findAll() {
        return proyectoService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProyectoDTO> findById(@PathVariable Long id) {
        return proyectoService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Proyectos en curso o pausados donde el alumno está inscrito
    @GetMapping("/alumno/{alumnoId}/activos")
    public List<ProyectoDTO> findActivosByAlumno(@PathVariable Long alumnoId) {
        return proyectoService.findActivosByAlumno(alumnoId);
    }

    // Proyectos finalizados donde el alumno está inscrito
    @GetMapping("/alumno/{alumnoId}/finalizados")
    public List<ProyectoDTO> findFinalizadosByAlumno(@PathVariable Long alumnoId) {
        return proyectoService.findFinalizadosByAlumno(alumnoId);
    }

    // Proyectos donde el alumno NO está inscrito
    @GetMapping("/alumno/{alumnoId}/explorar")
    public List<ProyectoDTO> findNoInscritosByAlumno(@PathVariable Long alumnoId) {
        return proyectoService.findNoInscritosByAlumno(alumnoId);
    }

    // ─── CREATE ──────────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<ProyectoDTO> create(@RequestBody ProyectoDTO dto) {
        ProyectoDTO creado = proyectoService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    // ─── UPDATE ──────────────────────────────────────────────────────────────

    @PutMapping("/{id}")
    public ResponseEntity<ProyectoDTO> update(@PathVariable Long id, @RequestBody ProyectoDTO dto) {
        return proyectoService.update(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── DELETE ──────────────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (proyectoService.delete(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}