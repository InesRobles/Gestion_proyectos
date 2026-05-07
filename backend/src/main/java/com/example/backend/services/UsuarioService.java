package com.example.backend.services;

import com.example.backend.dto.UsuarioDTO;
import com.example.backend.mapper.UsuarioMapper;
import com.example.backend.models.Usuarios;
import com.example.backend.repositories.UsuarioRepository;
import com.example.backend.exception.ElementoNoEncontradoException;
import com.example.backend.exception.ResourceAlreadyExistsException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioMapper usuarioMapper;
    private final PasswordEncoder passwordEncoder;

    // ── CREATE ──────────────────────────────────────────────
    public UsuarioDTO crearUsuario(UsuarioDTO usuarioDTO) {
        Optional<Usuarios> existingByNombre = usuarioRepository.findByNombreReal(usuarioDTO.getNombreReal());
        if (existingByNombre.isPresent()) {
            throw new ResourceAlreadyExistsException("Ya existe un usuario con el nombre: " + usuarioDTO.getNombreReal());
        }

        Usuarios usuario = usuarioMapper.toEntity(usuarioDTO);
        usuario.setContrasenaHash(passwordEncoder.encode(usuarioDTO.getContrasenaHash()));

        Usuarios usuarioGuardado = usuarioRepository.save(usuario);
        return usuarioMapper.toDTO(usuarioGuardado);
    }

    // ── READ (por ID) ────────────────────────────────────────
    public UsuarioDTO buscarUsuarioPorId(Long id) {
        Usuarios usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ElementoNoEncontradoException("Usuario no encontrado con id: " + id));
        return usuarioMapper.toDTO(usuario);
    }

    // ── READ (por nombre) ────────────────────────────────────
    public UsuarioDTO buscarUsuarioPorNombre(String nombreReal) {
        Usuarios usuario = usuarioRepository.findByNombreReal(nombreReal)
                .orElseThrow(() -> new ElementoNoEncontradoException("Usuario no encontrado con nombre: " + nombreReal));
        return usuarioMapper.toDTO(usuario);
    }

    // ── READ (todos) ─────────────────────────────────────────
    public List<UsuarioDTO> obtenerTodosLosUsuarios() {
        List<Usuarios> usuarios = usuarioRepository.findAll();
        return usuarioMapper.toDTO(usuarios);
    }

    // ── UPDATE ───────────────────────────────────────────────
    public UsuarioDTO actualizarUsuario(Long id, UsuarioDTO usuarioDTO) {
        Usuarios usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ElementoNoEncontradoException("Usuario no encontrado con id: " + id));

        if (!usuario.getNombreReal().equals(usuarioDTO.getNombreReal())) {
            usuarioRepository.findByNombreReal(usuarioDTO.getNombreReal()).ifPresent(u -> {
                throw new ResourceAlreadyExistsException("Ya existe un usuario con el nombre: " + usuarioDTO.getNombreReal());
            });
        }

        usuario.setNombreReal(usuarioDTO.getNombreReal());
        usuario.setRol(usuarioDTO.getRol());

        if (usuarioDTO.getContrasenaHash() != null && !usuarioDTO.getContrasenaHash().isBlank()) {
            usuario.setContrasenaHash(passwordEncoder.encode(usuarioDTO.getContrasenaHash()));
        }

        Usuarios usuarioActualizado = usuarioRepository.save(usuario);
        return usuarioMapper.toDTO(usuarioActualizado);
    }

    // ── DELETE ───────────────────────────────────────────────
    public void eliminarUsuario(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ElementoNoEncontradoException("Usuario no encontrado con id: " + id);
        }
        usuarioRepository.deleteById(id);
    }
}