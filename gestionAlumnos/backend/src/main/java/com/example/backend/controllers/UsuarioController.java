package com.example.backend.controllers;

import com.example.backend.dto.CambioFotoDTO;
import com.example.backend.dto.CambioPasswordDTO;
import com.example.backend.dto.UsuarioDTO;
import com.example.backend.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.backend.dto.LoginRequest;

import java.util.List;

@RestController
@RequestMapping("/api/usuario")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/crear")
    public UsuarioDTO crearUsuario(@RequestBody UsuarioDTO usuarioDTO) {
        return usuarioService.crearUsuario(usuarioDTO);
    }

    @GetMapping("/listar")
    public List<UsuarioDTO> listarUsuario() {
        return usuarioService.obtenerTodosLosUsuarios();
    }

    @GetMapping("/buscar/{id}")
    public UsuarioDTO buscarPorId(@PathVariable Long id) {
        return usuarioService.buscarUsuarioPorId(id);
    }

    @PutMapping("/editar/{id}")
    public UsuarioDTO editarUsuario(@PathVariable Long id, @RequestBody UsuarioDTO usuarioDTO) {
        return usuarioService.actualizarUsuario(id, usuarioDTO);
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id) {
        usuarioService.eliminarUsuario(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    public ResponseEntity<UsuarioDTO> login(@RequestBody LoginRequest loginRequest) {
        UsuarioDTO usuario = usuarioService.login(loginRequest);
        return ResponseEntity.ok(usuario);
    }

    @PutMapping("/cambiar-password/{id}")
    public ResponseEntity<Void> cambiarPassword(@PathVariable Long id, @RequestBody CambioPasswordDTO dto) {
        try {
            usuarioService.cambiarPassword(id, dto);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/foto/{id}")
    public ResponseEntity<Void> actualizarFoto(@PathVariable Long id, @RequestBody CambioFotoDTO dto) {
        usuarioService.actualizarFoto(id, dto.getFotoBase64());
        return ResponseEntity.noContent().build();
    }
}