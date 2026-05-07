package com.example.backend.controllers;

import com.example.backend.dto.AlumnoDTO;
import com.example.backend.services.AlumnoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alumno")
public class AlumnoController {

    @Autowired
    private AlumnoService alumnoService;

    @GetMapping
    public List<AlumnoDTO> listarAlumno() {
        return alumnoService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlumnoDTO> obtenerAlumno(@PathVariable Long id) {
        return alumnoService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}