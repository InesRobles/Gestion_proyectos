package com.example.backend.services;

import com.example.backend.dto.CambioPasswordDTO;
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
import com.example.backend.dto.LoginRequest;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private AlumnoRepository alumnoRepository;

    @Autowired
    private AlumnoService alumnoService;

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

        Usuario savedUsuario = usuarioRepository.save(usuario);
        
        if (com.example.backend.models.Rol.alumno.equals(savedUsuario.getRol())) {
            alumnoService.crearPerfilParaUsuario(savedUsuario);
        }

        return usuarioMapper.toDTO(savedUsuario);
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

        if (usuarioDTO.getNombreUsuario() != null
                && !usuarioDTO.getNombreUsuario().isBlank()
                && !usuarioDTO.getNombreUsuario().equals(usuario.getNombreUsuario())) {
            usuarioRepository.findByNombreUsuario(usuarioDTO.getNombreUsuario()).ifPresent(u -> {
                throw new ResourceAlreadyExistsException(
                        "Ya existe un usuario con el nombre de usuario: " + usuarioDTO.getNombreUsuario()
                );
            });
            usuario.setNombreUsuario(usuarioDTO.getNombreUsuario());
        }

        if (usuarioDTO.getNombreReal() != null
                && !usuarioDTO.getNombreReal().isBlank()
                && !usuarioDTO.getNombreReal().equals(usuario.getNombreReal())) {
            usuarioRepository.findByNombreReal(usuarioDTO.getNombreReal()).ifPresent(u -> {
                throw new ResourceAlreadyExistsException(
                        "Ya existe un usuario con el nombre real: " + usuarioDTO.getNombreReal()
                );
            });
            usuario.setNombreReal(usuarioDTO.getNombreReal());
        }

        if (usuarioDTO.getRol() != null) {
            usuario.setRol(usuarioDTO.getRol());
        }

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

        comentarioRepository.deleteAll(comentarioRepository.findByUsuarioId(id));
        alumnoRepository.findByUsuarioId(id).ifPresent(alumnoRepository::delete);
        usuarioRepository.deleteById(id);
    }

    public UsuarioDTO login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByNombreUsuario(request.getNombreUsuario())
                .orElseThrow(() -> new ElementoNoEncontradoException("Usuario no encontrado"));

        if (!passwordEncoder.matches(request.getContrasena(), usuario.getContrasenaHash())) {
            throw new ElementoNoEncontradoException("Contraseña incorrecta");
        }

        return usuarioMapper.toDTO(usuario);
    }

    public void cambiarPassword(Long id, CambioPasswordDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ElementoNoEncontradoException("Usuario no encontrado con id: " + id));

        if (!passwordEncoder.matches(dto.getContrasenaActual(), usuario.getContrasenaHash())) {
            throw new IllegalArgumentException("La contraseña actual es incorrecta");
        }

        usuario.setContrasenaHash(passwordEncoder.encode(dto.getContrasenaNueva()));
        usuarioRepository.save(usuario);
    }

    public void actualizarFoto(Long id, String fotoBase64) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ElementoNoEncontradoException("Usuario no encontrado con id: " + id));
        usuario.setFotoUsuario(fotoBase64);
        usuarioRepository.save(usuario);
    }
}