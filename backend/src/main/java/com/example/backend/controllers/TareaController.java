package com.example.backend.controllers;

import com.example.backend.dto.TareaProyectoDTO;
import com.example.backend.services.TareaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tarea")
@RequiredArgsConstructor
public class TareaController {

    private final TareaService tareaService;

    @GetMapping("/proyecto/{proyectoId}")
    public ResponseEntity<List<TareaProyectoDTO>> getTareas(@PathVariable Long proyectoId) {
        return ResponseEntity.ok(tareaService.getTareasPorProyecto(proyectoId));
    }

    @PutMapping("/proyecto/{proyectoId}")
    public ResponseEntity<List<TareaProyectoDTO>> guardarTareas(
            @PathVariable Long proyectoId,
            @RequestBody Map<String, List<String>> body) {
        List<String> titulos = body.get("titulos");
        return ResponseEntity.ok(tareaService.guardarTareas(proyectoId, titulos));
    }

    // ── ALUMNO ────────────────────────────────────────────────────────────────

    @GetMapping("/proyecto/{proyectoId}/usuario/{usuarioId}")
    public ResponseEntity<List<TareaProyectoDTO>> getTareasConEstado(
            @PathVariable Long proyectoId,
            @PathVariable Long usuarioId) {
        return ResponseEntity.ok(tareaService.getTareasConEstado(proyectoId, usuarioId));
    }

    @PatchMapping("/{tareaId}/usuario/{usuarioId}")
    public ResponseEntity<Void> toggleTarea(
            @PathVariable Long tareaId,
            @PathVariable Long usuarioId,
            @RequestBody Map<String, Boolean> body) {
        tareaService.toggleTarea(tareaId, usuarioId, body.get("completada"));
        return ResponseEntity.noContent().build();
    }
}