package com.example.backend.controllers;

import com.example.backend.dto.RegistroActividadDTO;
import com.example.backend.models.RegistroActividad;
import com.example.backend.services.RegistroActividadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/asistencia/actividad")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RegistroActividadController {

    private final RegistroActividadService registroActividadService;


    @PostMapping
    public ResponseEntity<RegistroActividad> registrar(@RequestBody RegistroActividadDTO dto) {
        RegistroActividad guardado = registroActividadService.registrar(dto);
        return ResponseEntity.ok(guardado);
    }


    @GetMapping("/hoy")
    public ResponseEntity<List<RegistroActividad>> getHoy() {
        return ResponseEntity.ok(registroActividadService.getHoy());
    }


    @GetMapping
    public ResponseEntity<List<RegistroActividad>> getPorUsuarioYFecha(
            @RequestParam Integer usuarioId,
            @RequestParam String  fecha) {
        return ResponseEntity.ok(registroActividadService.getPorUsuarioYFecha(usuarioId, fecha));
    }
}