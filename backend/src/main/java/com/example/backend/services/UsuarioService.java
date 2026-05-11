package com.example.backend.services;

import com.example.backend.dto.UsuarioDTO;
import com.example.backend.mapper.UsuarioMapper;
import com.example.backend.models.Usuario;
import com.example.backend.repositories.AlumnoRepository;
import com.example.backend.repositories.ComentarioRepository;
import com.example.backend.repositories.UsuarioRepository;
import com.example.backend.exception.ElementoNoEncontradoException;
import com.example.backend.exception.ResourceAlreadyExistsException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private AlumnoRepository alumnoRepository;

    @Autowired
    private ComentarioRepository comentarioRepository;

    @Autowired
    private UsuarioMapper usuarioMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UsuarioDTO crearUsuario(UsuarioDTO usuarioDTO) {
        if (usuarioRepository.findByNombreUsuario(usuarioDTO.getNombreUsuario()).isPresent()) {
            throw new ResourceAlreadyExistsException(
                    "Ya existe un usuario con el nombre de usuario: " + usuarioDTO.getNombreUsuario()
            );
        }
        if (usuarioRepository.findByNombreReal(usuarioDTO.getNombreReal()).isPresent()) {
            throw new ResourceAlreadyExistsException(
                    "Ya existe un usuario con el nombre real: " + usuarioDTO.getNombreReal()
            );
        }

        Usuario usuario = usuarioMapper.toEntity(usuarioDTO);
        usuario.setContrasenaHash(passwordEncoder.encode(usuarioDTO.getContrasenaHash()));

        return usuarioMapper.toDTO(usuarioRepository.save(usuario));
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
        return usuarioMapper.toDTO(usuarioRepository.findAll());
    }

    public UsuarioDTO actualizarUsuario(Long id, UsuarioDTO usuarioDTO) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ElementoNoEncontradoException("Usuario no encontrado con id: " + id));

        if (!usuario.getNombreUsuario().equals(usuarioDTO.getNombreUsuario())) {
            usuarioRepository.findByNombreUsuario(usuarioDTO.getNombreUsuario()).ifPresent(u -> {
                throw new ResourceAlreadyExistsException(
                        "Ya existe un usuario con el nombre de usuario: " + usuarioDTO.getNombreUsuario()
                );
            });
            usuario.setNombreUsuario(usuarioDTO.getNombreUsuario());
        }

        if (!usuario.getNombreReal().equals(usuarioDTO.getNombreReal())) {
            usuarioRepository.findByNombreReal(usuarioDTO.getNombreReal()).ifPresent(u -> {
                throw new ResourceAlreadyExistsException(
                        "Ya existe un usuario con el nombre real: " + usuarioDTO.getNombreReal()
                );
            });
            usuario.setNombreReal(usuarioDTO.getNombreReal());
        }

        usuario.setRol(usuarioDTO.getRol());

        if (usuarioDTO.getContrasenaHash() != null && !usuarioDTO.getContrasenaHash().isBlank()) {
            usuario.setContrasenaHash(passwordEncoder.encode(usuarioDTO.getContrasenaHash()));
        }

        return usuarioMapper.toDTO(usuarioRepository.save(usuario));
    }

    @Transactional
    public void eliminarUsuario(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ElementoNoEncontradoException("Usuario no encontrado con id: " + id);
        }

        // Eliminar comentarios del usuario para evitar fallo de foreign key
        comentarioRepository.deleteAll(comentarioRepository.findByUsuarioId(id));

        // Eliminar el alumno asociado si existe, para evitar el fallo de foreign key
        alumnoRepository.findByUsuarioId(id).ifPresent(alumnoRepository::delete);

        usuarioRepository.deleteById(id);
    }
}