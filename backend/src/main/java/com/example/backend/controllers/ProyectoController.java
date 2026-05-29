package com.example.backend.controllers;

import com.example.backend.dto.ProyectoDTO;
import com.example.backend.dto.ProyectoDocumentoDTO;
import com.example.backend.dto.ProyectoImagenDTO;
import com.example.backend.services.ProyectoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proyecto")
public class ProyectoController {

    @Autowired
    private ProyectoService proyectoService;

    // ─── READ ────────────────────────────────────────────────────────────────

    @GetMapping
    public List<ProyectoDTO> findAll(@RequestParam(required = false) Long usuarioId) {
        return proyectoService.findAllFiltered(usuarioId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProyectoDTO> findById(
            @PathVariable Long id,
            @RequestParam(required = false) Long usuarioId) {
        return proyectoService.findByIdFiltered(id, usuarioId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }



    // ─── CREATE ──────────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<ProyectoDTO> create(@RequestBody ProyectoDTO dto) {
        ProyectoDTO creado = proyectoService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    // ─── UPDATE ──────────────────────────────────────────────────────────────

    @PutMapping("/{id}")
    public ResponseEntity<ProyectoDTO> update(
            @PathVariable Long id,
            @RequestBody ProyectoDTO dto,
            @RequestParam(required = false) Long usuarioId) {
        if (usuarioId != null && !proyectoService.puedeEditar(id, usuarioId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return proyectoService.update(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── DELETE ──────────────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestParam(required = false) Long usuarioId) {
        if (usuarioId != null && !proyectoService.puedeEditar(id, usuarioId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        if (proyectoService.delete(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // ─── DOCUMENTS & IMAGES ENDPOINTS ────────────────────────────────────────

    @PostMapping("/{id}/documento")
    public ResponseEntity<ProyectoDTO> agregarDocumento(
            @PathVariable Long id,
            @RequestBody ProyectoDocumentoDTO doc,
            @RequestParam(required = false) Long usuarioId) {
        if (usuarioId != null && !proyectoService.puedeEditar(id, usuarioId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(proyectoService.agregarDocumento(id, doc));
    }

    @DeleteMapping("/{id}/documento/{docId}")
    public ResponseEntity<Void> eliminarDocumento(
            @PathVariable Long id,
            @PathVariable Long docId,
            @RequestParam(required = false) Long usuarioId) {
        if (usuarioId != null && !proyectoService.puedeEditar(id, usuarioId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        proyectoService.eliminarDocumento(docId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/imagen")
    public ResponseEntity<ProyectoDTO> agregarImagen(
            @PathVariable Long id,
            @RequestBody ProyectoImagenDTO img,
            @RequestParam(required = false) Long usuarioId) {
        if (usuarioId != null && !proyectoService.puedeEditar(id, usuarioId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(proyectoService.agregarImagen(id, img));
    }

    @DeleteMapping("/{id}/imagen/{imgId}")
    public ResponseEntity<Void> eliminarImagen(
            @PathVariable Long id,
            @PathVariable Long imgId,
            @RequestParam(required = false) Long usuarioId) {
        if (usuarioId != null && !proyectoService.puedeEditar(id, usuarioId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        proyectoService.eliminarImagen(imgId);
        return ResponseEntity.noContent().build();
    }
}