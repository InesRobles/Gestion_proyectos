package com.example.backend.services;

import com.example.backend.dto.ProyectoDTO;
import com.example.backend.mapper.ProyectoMapper;
import com.example.backend.models.Proyecto;
import com.example.backend.repositories.ProyectoRepository;
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

    // ─── READ ────────────────────────────────────────────────────────────────

    public List<ProyectoDTO> findAll() {
        return proyectoRepository.findAll().stream()
                .map(proyectoMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<ProyectoDTO> findById(Long id) {
        return proyectoRepository.findById(id).map(proyectoMapper::toDTO);
    }

    // Proyectos 'en curso' o 'pausado' donde el alumno está inscrito
    @Transactional
    public List<ProyectoDTO> findActivosByAlumno(Long usuarioId) {
        Long alumnoId = alumnoRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ElementoNoEncontradoException(
                        "No se encontró un alumno para el usuario: " + usuarioId))
                .getId();
        return proyectoRepository
                .findByAsignaciones_AlumnoIdAndEstadoIn(alumnoId,
                        List.of(EstadoProyecto.EN_CURSO, EstadoProyecto.PAUSADO, EstadoProyecto.FINALIZADO))
                .stream().map(p -> {
                    ProyectoDTO dto = proyectoMapper.toDTO(p);
                    dto.setCuposDisponibles(p.getCupoMaximo() - (int) asignacionRepository.countByIdProyectoId(p.getId()));
                    return dto;
                }).collect(Collectors.toList());
    }

    @Transactional
    public List<ProyectoDTO> findFinalizadosByAlumno(Long alumnoId) {
        return proyectoRepository
                .findByAsignaciones_AlumnoIdAndEstadoIn(alumnoId,
                        List.of(EstadoProyecto.FINALIZADO))
                .stream().map(p -> {
                    ProyectoDTO dto = proyectoMapper.toDTO(p);
                    dto.setCuposDisponibles(p.getCupoMaximo() - (int) asignacionRepository.countByIdProyectoId(p.getId()));
                    return dto;
                }).collect(Collectors.toList());
    }

    // Proyectos donde el alumno NO está inscrito
    @Transactional
    public List<ProyectoDTO> findNoInscritosByAlumno(Long usuarioId) {
        Long alumnoId = alumnoRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ElementoNoEncontradoException(
                        "No se encontró un alumno para el usuario: " + usuarioId))
                .getId();
        return proyectoRepository
                .findByAsignaciones_AlumnoIdNotContaining(alumnoId)
                .stream()
                .map(p -> {
                    long inscritos = asignacionRepository.countByIdProyectoId(p.getId());
                    ProyectoDTO dto = proyectoMapper.toDTO(p);
                    dto.setCuposDisponibles(p.getCupoMaximo() - (int) inscritos);
                    return dto;
                })
                .filter(dto -> dto.getCuposDisponibles() > 0)
                .collect(Collectors.toList());
    }
    // ─── CREATE ──────────────────────────────────────────────────────────────

    public ProyectoDTO create(ProyectoDTO dto) {
        Proyecto proyecto = proyectoMapper.toEntity(dto);
        Proyecto guardado = proyectoRepository.save(proyecto);
        return proyectoMapper.toDTO(guardado);
    }

    // ─── UPDATE ──────────────────────────────────────────────────────────────

    public Optional<ProyectoDTO> update(Long id, ProyectoDTO dto) {
        return proyectoRepository.findById(id).map(existing -> {
            existing.setTitulo(dto.getTitulo());
            existing.setDescripcion(dto.getDescripcion());
            existing.setCupoMaximo(dto.getCupoMaximo());
            existing.setEstado(dto.getEstado());
            existing.setFotoProyecto(dto.getFotoProyecto());
            existing.setVideoUrl(dto.getVideoUrl());
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
}