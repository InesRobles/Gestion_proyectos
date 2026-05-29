package com.example.backend.services;

import com.example.backend.dto.ProyectoDTO;
import com.example.backend.dto.ProyectoDocumentoDTO;
import com.example.backend.dto.ProyectoImagenDTO;
import com.example.backend.mapper.ProyectoMapper;
import com.example.backend.models.Proyecto;
import com.example.backend.models.ProyectoDocumento;
import com.example.backend.models.ProyectoImagen;
import com.example.backend.models.Usuario;
import com.example.backend.models.Alumno;
import com.example.backend.models.Asignacion;
import com.example.backend.models.AsignacionId;
import com.example.backend.repositories.ProyectoRepository;
import com.example.backend.repositories.UsuarioRepository;
import com.example.backend.repositories.ProyectoDocumentoRepository;
import com.example.backend.repositories.ProyectoImagenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.backend.repositories.AlumnoRepository;
import com.example.backend.repositories.AsignacionRepository;
import com.example.backend.exception.ElementoNoEncontradoException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import com.example.backend.models.EstadoProyecto;
import com.example.backend.models.Rol;

@Service
@RequiredArgsConstructor
public class ProyectoService {

    @Autowired
    private ProyectoRepository proyectoRepository;
    @Autowired
    private AlumnoRepository alumnoRepository;
    @Autowired
    private AsignacionRepository asignacionRepository;
    @Autowired
    private ProyectoMapper proyectoMapper;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private ProyectoDocumentoRepository proyectoDocumentoRepository;
    @Autowired
    private ProyectoImagenRepository proyectoImagenRepository;

    // ─── PERMISSION CHECK ───────────────────────────────────────────────────

    public boolean puedeEditar(Long proyectoId, Long usuarioId) {
        if (usuarioId == null) {
            return false;
        }
        Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
        if (usuario == null) {
            return false;
        }

        // Si es el administrador global de la aplicación
        if (Rol.admin.equals(usuario.getRol())) {
            return true;
        }

        Proyecto proyecto = proyectoRepository.findById(proyectoId).orElse(null);
        if (proyecto == null) {
            return false;
        }

        // Si es el creador del proyecto
        if (proyecto.getCreador() != null && proyecto.getCreador().getId().equals(usuarioId)) {
            return true;
        }

        // Si es un alumno asignado al proyecto (colaborador) con rol 'editor'
        Optional<Alumno> alumnoOpt = alumnoRepository.findByUsuarioId(usuarioId);
        if (alumnoOpt.isPresent()) {
            AsignacionId asignacionId = new AsignacionId(alumnoOpt.get().getId(), proyectoId);
            return asignacionRepository.findById(asignacionId)
                    .map(a -> "editor".equals(a.getRol()))
                    .orElse(false);
        }

        return false;
    }

    private boolean esCreadorOColaboradorOAdmin(Proyecto p, Long usuarioId) {
        if (usuarioId == null) {
            return false;
        }
        Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
        if (usuario == null) {
            return false;
        }
        // Si el usuario es el administrador global de la aplicación
        if (Rol.admin.equals(usuario.getRol())) {
            return true;
        }
        // Si es el creador del proyecto
        if (p.getCreador() != null && p.getCreador().getId().equals(usuarioId)) {
            return true;
        }
        // Si el usuario es un alumno colaborador asignado al proyecto (cualquier rol)
        Optional<Alumno> alumnoOpt = alumnoRepository.findByUsuarioId(usuarioId);
        if (alumnoOpt.isPresent()) {
            Long alumnoId = alumnoOpt.get().getId();
            return asignacionRepository.existsByIdAlumnoIdAndIdProyectoId(alumnoId, p.getId());
        }
        return false;
    }

    // ─── READ ────────────────────────────────────────────────────────────────

    public List<ProyectoDTO> findAll() {
        return proyectoRepository.findAll().stream()
                .map(proyectoMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<ProyectoDTO> findAllFiltered(Long usuarioId) {
        return proyectoRepository.findAll().stream()
                .filter(p -> {
                    if (p.getPrivado() == null || !p.getPrivado()) {
                        return true;
                    }
                    return esCreadorOColaboradorOAdmin(p, usuarioId);
                })
                .map(proyectoMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<ProyectoDTO> findById(Long id) {
        return proyectoRepository.findById(id).map(proyectoMapper::toDTO);
    }

    public Optional<ProyectoDTO> findByIdFiltered(Long id, Long usuarioId) {
        return proyectoRepository.findById(id)
                .filter(p -> {
                    if (p.getPrivado() == null || !p.getPrivado()) {
                        return true;
                    }
                    return esCreadorOColaboradorOAdmin(p, usuarioId);
                })
                .map(proyectoMapper::toDTO);
    }


    // ─── CREATE ──────────────────────────────────────────────────────────────

    @Transactional
    public ProyectoDTO create(ProyectoDTO dto) {
        Proyecto proyecto = proyectoMapper.toEntity(dto);

        if (dto.getCreadorId() != null) {
            Usuario creador = usuarioRepository.findById(dto.getCreadorId()).orElse(null);
            proyecto.setCreador(creador);
        }

        Proyecto guardado = proyectoRepository.save(proyecto);

        // Si el creador es un alumno, lo asignamos automáticamente al proyecto
        if (dto.getCreadorId() != null) {
            Optional<Alumno> alumnoOpt = alumnoRepository.findByUsuarioId(dto.getCreadorId());
            if (alumnoOpt.isPresent()) {
                Alumno alumno = alumnoOpt.get();
                AsignacionId asignacionId = new AsignacionId(alumno.getId(), guardado.getId());
                Asignacion asignacion = new Asignacion(asignacionId, alumno, guardado);
                asignacionRepository.save(asignacion);
            }
        }

        return proyectoMapper.toDTO(guardado);
    }

    // ─── UPDATE ──────────────────────────────────────────────────────────────

    @Transactional
    public Optional<ProyectoDTO> update(Long id, ProyectoDTO dto) {
        return proyectoRepository.findById(id).map(existing -> {
            existing.setTitulo(dto.getTitulo());
            existing.setDescripcion(dto.getDescripcion());

            existing.setEstado(dto.getEstado());
            existing.setFotoProyecto(dto.getFotoProyecto());
            existing.setVideoUrl(dto.getVideoUrl());
            existing.setEnlaceGithub(dto.getEnlaceGithub());
            existing.setMemoria(dto.getMemoria());
            existing.setPrivado(dto.getPrivado());

            return proyectoMapper.toDTO(proyectoRepository.save(existing));
        });
    }

    // ─── DELETE ──────────────────────────────────────────────────────────────

    public boolean delete(Long id) {
        if (!proyectoRepository.existsById(id)) {
            return false;
        }
        proyectoRepository.deleteById(id);
        return true;
    }

    // ─── DOCUMENTS & IMAGES HELPERS ──────────────────────────────────────────

    @Transactional
    public ProyectoDTO agregarDocumento(Long proyectoId, ProyectoDocumentoDTO docDto) {
        Proyecto proyecto = proyectoRepository.findById(proyectoId)
                .orElseThrow(() -> new ElementoNoEncontradoException("Proyecto no encontrado: " + proyectoId));

        ProyectoDocumento doc = new ProyectoDocumento();
        doc.setNombre(docDto.getNombre());
        doc.setContenido(docDto.getContenido());
        doc.setProyecto(proyecto);
        proyectoDocumentoRepository.save(doc);

        return proyectoMapper.toDTO(proyectoRepository.findById(proyectoId).orElse(proyecto));
    }

    @Transactional
    public void eliminarDocumento(Long docId) {
        proyectoDocumentoRepository.deleteById(docId);
    }

    @Transactional
    public ProyectoDTO agregarImagen(Long proyectoId, ProyectoImagenDTO imgDto) {
        Proyecto proyecto = proyectoRepository.findById(proyectoId)
                .orElseThrow(() -> new ElementoNoEncontradoException("Proyecto no encontrado: " + proyectoId));

        ProyectoImagen img = new ProyectoImagen();
        img.setNombre(imgDto.getNombre());
        img.setContenido(imgDto.getContenido());
        img.setProyecto(proyecto);
        proyectoImagenRepository.save(img);

        return proyectoMapper.toDTO(proyectoRepository.findById(proyectoId).orElse(proyecto));
    }

    @Transactional
    public void eliminarImagen(Long imgId) {
        proyectoImagenRepository.deleteById(imgId);
    }
}