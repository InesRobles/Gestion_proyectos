package com.example.backend.services;

import com.example.backend.dto.ComentarioDTO;
import com.example.backend.exception.ElementoNoEncontradoException;
import com.example.backend.mapper.ComentarioMapper;
import com.example.backend.models.Comentario;
import com.example.backend.models.Proyecto;
import com.example.backend.models.Usuario;
import com.example.backend.repositories.ComentarioRepository;
import com.example.backend.repositories.ProyectoRepository;
import com.example.backend.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComentarioService {

    private final ComentarioRepository comentarioRepository;
    private final ProyectoRepository   proyectoRepository;
    private final UsuarioRepository    usuarioRepository;
    private final ComentarioMapper comentarioMapper;

    public List<ComentarioDTO> getComentariosPorProyecto(Long proyectoId) {
        return comentarioMapper.toDTO(
                comentarioRepository.findByProyectoIdOrderByFechaAsc(proyectoId)
        );
    }

    @Transactional
    public ComentarioDTO crear(Long proyectoId, Long usuarioId, String texto) {
        Proyecto proyecto = proyectoRepository.findById(proyectoId)
                .orElseThrow(() -> new ElementoNoEncontradoException("Proyecto no encontrado: " + proyectoId));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ElementoNoEncontradoException("Usuario no encontrado: " + usuarioId));

        Comentario c = new Comentario();
        c.setProyecto(proyecto);
        c.setUsuario(usuario);
        c.setTexto(texto.trim());
        c.setFecha(LocalDateTime.now());

        return comentarioMapper.toDTO(comentarioRepository.save(c));
    }

    @Transactional
    public void eliminar(Long comentarioId, Long usuarioId) {
        Comentario c = comentarioRepository.findById(comentarioId)
                .orElseThrow(() -> new ElementoNoEncontradoException("Comentario no encontrado: " + comentarioId));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ElementoNoEncontradoException("Usuario no encontrado: " + usuarioId));

        boolean esAutor = c.getUsuario().getId().equals(usuarioId);

        if (!esAutor) {
            throw new SecurityException("No tienes permiso para eliminar este comentario.");
        }

        comentarioRepository.deleteById(comentarioId);
    }
}