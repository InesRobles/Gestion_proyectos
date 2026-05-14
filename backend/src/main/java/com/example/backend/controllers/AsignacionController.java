package com.example.backend.controllers;

import com.example.backend.dto.AsignacionDTO;
import com.example.backend.dto.ProyectoDTO;
import com.example.backend.models.AsignacionId;
import com.example.backend.services.AsignacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/asignacion")
public class AsignacionController {

    @Autowired
    private AsignacionService asignacionService;

    @GetMapping
    public List<AsignacionDTO> findAll() {
        return asignacionService.findAll();
    }

    // Devuelve los proyectos en los que está inscrito el usuario (por su usuarioId)
    // El frontend llama a: GET /api/asignacion/alumno/{usuarioId}
    @GetMapping("/alumno/{usuarioId}")
    public ResponseEntity<List<ProyectoDTO>> getProyectosPorAlumno(@PathVariable Long usuarioId) {
        List<ProyectoDTO> proyectos = asignacionService.getProyectosPorUsuario(usuarioId);
        return ResponseEntity.ok(proyectos);
    }

    @PostMapping
    public ResponseEntity<AsignacionDTO> inscribir(@RequestBody Map<String, Long> body) {
        Long alumnoId   = body.get("alumnoId");
        Long proyectoId = body.get("proyectoId");
        AsignacionDTO resultado = asignacionService.inscribir(alumnoId, proyectoId);
        return ResponseEntity.status(HttpStatus.CREATED).body(resultado);
    }
}
