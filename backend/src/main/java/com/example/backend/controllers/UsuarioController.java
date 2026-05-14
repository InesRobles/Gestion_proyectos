package com.example.backend.controllers;

import com.example.backend.dto.CambioPasswordDTO;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.UsuarioDTO;
import com.example.backend.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuario")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping("/listar")
    public List<UsuarioDTO> findAll() {
        return usuarioService.obtenerTodosLosUsuarios();
    }

    @GetMapping("/buscar/{id}")
    public ResponseEntity<UsuarioDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.buscarUsuarioPorId(id));
    }

    @PostMapping("/crear")
    public ResponseEntity<UsuarioDTO> create(@RequestBody UsuarioDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.crearUsuario(dto));
    }

    @PostMapping("/login")
    public ResponseEntity<UsuarioDTO> login(@RequestBody LoginRequest dto) {
        return ResponseEntity.ok(usuarioService.login(dto));
    }

    @PutMapping("/editar/{id}")
    public ResponseEntity<UsuarioDTO> update(@PathVariable Long id, @RequestBody UsuarioDTO dto) {
        return ResponseEntity.ok(usuarioService.actualizarUsuario(id, dto));
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        usuarioService.eliminarUsuario(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/cambiar-password/{id}")
    public ResponseEntity<Void> cambiarPassword(@PathVariable Long id, @RequestBody CambioPasswordDTO dto) {
        usuarioService.cambiarPassword(id, dto);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/foto/{id}")
    public ResponseEntity<Void> actualizarFoto(@PathVariable Long id, @RequestBody Map<String, String> body) {
        usuarioService.actualizarFoto(id, body.get("fotoBase64"));
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/modalidad/{modalidadId}")
    public ResponseEntity<Void> actualizarModalidad(
            @PathVariable Long id,
            @PathVariable Long modalidadId) {
        usuarioService.actualizarModalidad(id, modalidadId);
        return ResponseEntity.noContent().build();
    }
}