package com.example.backend.services;

import com.example.backend.dto.UsuarioDTO;
import com.example.backend.mapper.UsuarioMapper;
import com.example.backend.exception.ElementoNoEncontradoException;
import com.example.backend.exception.ResourceAlreadyExistsException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {


    public UsuarioDTO crearUsuario(UsuarioDTO usuarioDTO) {
        }

        usuario.setContrasenaHash(passwordEncoder.encode(usuarioDTO.getContrasenaHash()));

    }

    public UsuarioDTO buscarUsuarioPorId(Long id) {
                .orElseThrow(() -> new ElementoNoEncontradoException("Usuario no encontrado con id: " + id));
        return usuarioMapper.toDTO(usuario);
    }

    public UsuarioDTO buscarUsuarioPorNombre(String nombreReal) {
                .orElseThrow(() -> new ElementoNoEncontradoException("Usuario no encontrado con nombre: " + nombreReal));
        return usuarioMapper.toDTO(usuario);
    }

    public List<UsuarioDTO> obtenerTodosLosUsuarios() {
    }

    public UsuarioDTO actualizarUsuario(Long id, UsuarioDTO usuarioDTO) {
                .orElseThrow(() -> new ElementoNoEncontradoException("Usuario no encontrado con id: " + id));

            usuarioRepository.findByNombreReal(usuarioDTO.getNombreReal()).ifPresent(u -> {
            });
            usuario.setNombreReal(usuarioDTO.getNombreReal());
            usuario.setRol(usuarioDTO.getRol());

        if (usuarioDTO.getContrasenaHash() != null && !usuarioDTO.getContrasenaHash().isBlank()) {
            usuario.setContrasenaHash(passwordEncoder.encode(usuarioDTO.getContrasenaHash()));
        }

    }

    public void eliminarUsuario(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ElementoNoEncontradoException("Usuario no encontrado con id: " + id);
        }
        usuarioRepository.deleteById(id);
    }
}