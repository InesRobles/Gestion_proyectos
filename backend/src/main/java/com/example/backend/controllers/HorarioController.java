package com.example.backend.controllers;

import com.example.backend.dto.HorariosDTO;
import com.example.backend.services.HorarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/horario")
@RequiredArgsConstructor
public class HorarioController {

    private final HorarioService horariosService;

    @GetMapping
    public List<HorariosDTO> findAll() {
        return horariosService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<HorariosDTO> findById(@PathVariable Long id) {
        return horariosService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/alumno/{alumnoId}")
    public List<HorariosDTO> findByAlumno(@PathVariable Long alumnoId) {
        return horariosService.findByAlumnoId(alumnoId);
    }

    @PostMapping
    public HorariosDTO create(@RequestBody HorariosDTO horariosDTO) {
        return horariosService.save(horariosDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        horariosService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}