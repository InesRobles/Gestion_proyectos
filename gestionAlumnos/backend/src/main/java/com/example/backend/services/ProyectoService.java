package com.example.backend.services;

import com.example.backend.dto.ProyectoDTO;
import com.example.backend.mapper.ProyectoMapper;
import com.example.backend.models.Proyecto;
import com.example.backend.repositories.ProyectoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProyectoService {

    @Autowired
    private ProyectoRepository proyectoRepository;

    @Autowired
    private ProyectoMapper proyectoMapper;

    @Autowired
    private com.example.backend.repositories.AsignacionRepository asignacionRepository;

    // Helper para mapear y calcular cupos reales
    private ProyectoDTO enrichDTO(Proyecto proyecto) {
        ProyectoDTO dto = proyectoMapper.toDTO(proyecto);
        long inscritos = asignacionRepository.countByIdProyectoId(proyecto.getId());
        dto.setCuposDisponibles(proyecto.getCupoMaximo() - (int)inscritos);
        return dto;
    }

    // ─── READ ────────────────────────────────────────────────────────────────

    public List<ProyectoDTO> findAll() {
        return proyectoRepository.findAll().stream()
                .map(this::enrichDTO)
                .collect(Collectors.toList());
    }

    public Optional<ProyectoDTO> findById(Long id) {
        return proyectoRepository.findById(id).map(this::enrichDTO);
    }

    @Autowired
    private com.example.backend.repositories.AlumnoRepository alumnoRepository;

    private Long getAlumnoId(Long usuarioId) {
        return alumnoRepository.findByUsuarioId(usuarioId)
                .map(com.example.backend.models.Alumno::getId)
                .orElse(-1L);
    }

    // Proyectos 'en curso' o 'pausado' donde el alumno está inscrito
    public List<ProyectoDTO> findActivosByAlumno(Long usuarioId) {
        Long alumnoId = getAlumnoId(usuarioId);
        return proyectoRepository
                .findByAsignaciones_AlumnoIdAndEstadoIn(alumnoId, List.of(com.example.backend.models.EstadoProyecto.EN_CURSO, com.example.backend.models.EstadoProyecto.PAUSADO))
                .stream().map(this::enrichDTO).collect(Collectors.toList());
    }

    // Proyectos 'finalizado' donde el alumno está inscrito
    public List<ProyectoDTO> findFinalizadosByAlumno(Long usuarioId) {
        Long alumnoId = getAlumnoId(usuarioId);
        return proyectoRepository
                .findByAsignaciones_AlumnoIdAndEstadoIn(alumnoId, List.of(com.example.backend.models.EstadoProyecto.FINALIZADO))
                .stream().map(this::enrichDTO).collect(Collectors.toList());
    }

    // Proyectos donde el alumno NO está inscrito
    public List<ProyectoDTO> findNoInscritosByAlumno(Long usuarioId) {
        Long alumnoId = getAlumnoId(usuarioId);
        return proyectoRepository
                .findByAsignaciones_AlumnoIdNotContaining(alumnoId)
                .stream().map(this::enrichDTO).collect(Collectors.toList());
    }

    // ─── CREATE ──────────────────────────────────────────────────────────────

    public ProyectoDTO create(ProyectoDTO dto) {
        Proyecto proyecto = proyectoMapper.toEntity(dto);
        Proyecto guardado = proyectoRepository.save(proyecto);
        return enrichDTO(guardado);
    }

    // ─── UPDATE ──────────────────────────────────────────────────────────────

    public Optional<ProyectoDTO> update(Long id, ProyectoDTO dto) {
        return proyectoRepository.findById(id).map(existing -> {
            existing.setTitulo(dto.getTitulo());
            existing.setDescripcion(dto.getDescripcion());
            existing.setCupoMaximo(dto.getCupoMaximo());
            existing.setEstado(dto.getEstado());
            Proyecto actualizado = proyectoRepository.save(existing);
            return enrichDTO(actualizado);
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
}