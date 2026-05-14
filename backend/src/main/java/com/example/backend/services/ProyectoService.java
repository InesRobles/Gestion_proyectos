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
    public List<ProyectoDTO> findActivosByAlumno(Long alumnoId) {
        return proyectoRepository
                .findByAsignaciones_AlumnoIdAndEstadoIn(alumnoId, List.of("en curso", "pausado"))
                .stream().map(proyectoMapper::toDTO).collect(Collectors.toList());
    }

    // Proyectos 'finalizado' donde el alumno está inscrito
    public List<ProyectoDTO> findFinalizadosByAlumno(Long alumnoId) {
        return proyectoRepository
                .findByAsignaciones_AlumnoIdAndEstadoIn(alumnoId, List.of("finalizado"))
                .stream().map(proyectoMapper::toDTO).collect(Collectors.toList());
    }

    // Proyectos donde el alumno NO está inscrito
    public List<ProyectoDTO> findNoInscritosByAlumno(Long alumnoId) {
        return proyectoRepository
                .findByAsignaciones_AlumnoIdNotContaining(alumnoId)
                .stream().map(proyectoMapper::toDTO).collect(Collectors.toList());
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