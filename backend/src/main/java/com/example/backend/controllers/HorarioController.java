package com.example.backend.controllers;

import com.example.backend.dto.HorarioDTO;
import com.example.backend.services.HorarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/horario")
@RequiredArgsConstructor
public class HorarioController {

    private final HorarioService horarioService;

    @GetMapping
    public List<HorarioDTO> findAll() {
        return horarioService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<HorarioDTO> findById(@PathVariable Long id) {
        return horarioService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/alumno/{alumnoId}")
    public List<HorarioDTO> findByAlumno(@PathVariable Long alumnoId) {
        return horarioService.findByAlumnoId(alumnoId);
    }

    @PostMapping
    public HorarioDTO create(@RequestBody HorarioDTO horarioDTO) {
        return horarioService.save(horarioDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        horarioService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}