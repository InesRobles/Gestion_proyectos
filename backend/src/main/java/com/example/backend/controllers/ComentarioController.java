package com.example.backend.controllers;

import com.example.backend.dto.ComentarioDTO;
import com.example.backend.services.ComentarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comentario")
@RequiredArgsConstructor
public class ComentarioController {

    private final ComentarioService comentarioService;

    @PostMapping
    public ResponseEntity<ComentarioDTO> guardar(@RequestBody ComentarioDTO dto) {
        return new ResponseEntity<>(comentarioService.crearComentario(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public List<ComentarioDTO> listar() {
        return comentarioService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ComentarioDTO buscar(@PathVariable Long id) {
        return comentarioService.obtenerPorId(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void borrar(@PathVariable Long id) {
        comentarioService.eliminarComentario(id);
    }
}