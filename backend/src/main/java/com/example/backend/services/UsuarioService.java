package com.example.backend.services;

import com.example.backend.dto.UsuarioDTO;
import com.example.backend.mapper.UsuarioMapper;
import com.example.backend.models.Usuario;
import com.example.backend.repositories.UsuarioRepository;
import com.example.backend.exception.ElementoNoEncontradoException;
import com.example.backend.exception.ResourceAlreadyExistsException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private UsuarioMapper usuarioMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;


    public UsuarioDTO crearUsuario(UsuarioDTO usuarioDTO) {
        Optional<Usuario> existingByNombre = usuarioRepository.findByNombreReal(usuarioDTO.getNombreReal());
        if (existingByNombre.isPresent()) {
            throw new ResourceAlreadyExistsException("Ya existe un usuario con el nombre: " + usuarioDTO.getNombreReal());
        }

        Usuario usuario = usuarioMapper.toEntity(usuarioDTO);
        usuario.setContrasenaHash(passwordEncoder.encode(usuarioDTO.getContrasenaHash()));

        Usuario usuarioGuardado = usuarioRepository.save(usuario);
        return usuarioMapper.toDTO(usuarioGuardado);
    }

    public UsuarioDTO buscarUsuarioPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ElementoNoEncontradoException("Usuario no encontrado con id: " + id));
        return usuarioMapper.toDTO(usuario);
    }

    public UsuarioDTO buscarUsuarioPorNombre(String nombreReal) {
        Usuario usuario = usuarioRepository.findByNombreReal(nombreReal)
                .orElseThrow(() -> new ElementoNoEncontradoException("Usuario no encontrado con nombre: " + nombreReal));
        return usuarioMapper.toDTO(usuario);
    }

    public List<UsuarioDTO> obtenerTodosLosUsuarios() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        return usuarioMapper.toDTO(usuarios);
    }

    public UsuarioDTO actualizarUsuario(Long id, UsuarioDTO usuarioDTO) {
        Usuario usuario = usuarioRepository.findById(id)
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

        Usuario usuarioActualizado = usuarioRepository.save(usuario);
        return usuarioMapper.toDTO(usuarioActualizado);
    }

    public void eliminarUsuario(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ElementoNoEncontradoException("Usuario no encontrado con id: " + id);
        }
        usuarioRepository.deleteById(id);
    }
}