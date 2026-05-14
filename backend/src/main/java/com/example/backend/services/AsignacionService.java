package com.example.backend.services;

import com.example.backend.dto.AsignacionDTO;
import com.example.backend.dto.ProyectoDTO;
import com.example.backend.exception.CupoLlenoException;
import com.example.backend.exception.ElementoNoEncontradoException;
import com.example.backend.exception.ResourceAlreadyExistsException;
import com.example.backend.mapper.AsignacionMapper;
import com.example.backend.mapper.ProyectoMapper;
import com.example.backend.models.Alumno;
import com.example.backend.models.Asignacion;
import com.example.backend.models.AsignacionId;
import com.example.backend.models.Proyecto;
import com.example.backend.repositories.AlumnoRepository;
import com.example.backend.repositories.AsignacionRepository;
import com.example.backend.repositories.ProyectoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AsignacionService {

    @Autowired
    private AsignacionRepository asignacionRepository;

    @Autowired
    private AsignacionMapper asignacionMapper;

    @Autowired
    private ProyectoMapper proyectoMapper;

    @Autowired
    private ProyectoRepository proyectoRepository;

    @Autowired
    private AlumnoRepository alumnoRepository;

    public List<AsignacionDTO> findAll() {
        return asignacionRepository.findAll()
                .stream()
                .map(asignacionMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<AsignacionDTO> findById(AsignacionId id) {
        return asignacionRepository.findById(id)
                .map(asignacionMapper::toDTO);
    }

    // Devuelve los proyectos en los que el usuario (por su usuarioId) está inscrito
    public List<ProyectoDTO> getProyectosPorUsuario(Long usuarioId) {
        Alumno alumno = alumnoRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ElementoNoEncontradoException(
                        "No se encontró un alumno asociado al usuario con id: " + usuarioId));

        return asignacionRepository.findByIdAlumnoId(alumno.getId())
                .stream()
                .map(asignacion -> proyectoMapper.toDTO(asignacion.getProyecto()))
                .collect(Collectors.toList());
    }

    @Transactional
    public AsignacionDTO inscribir(Long usuarioId, Long proyectoId) {
        Proyecto proyecto = proyectoRepository.findById(proyectoId)
                .orElseThrow(() -> new ElementoNoEncontradoException(
                        "Proyecto no encontrado con id: " + proyectoId));

        Alumno alumno = alumnoRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ElementoNoEncontradoException(
                        "No se encontró un alumno asociado al usuario con id: " + usuarioId));

        if (asignacionRepository.existsByIdAlumnoIdAndIdProyectoId(alumno.getId(), proyectoId)) {
            throw new ResourceAlreadyExistsException(
                    "El alumno ya está inscrito en este proyecto.");
        }

        long inscritos = asignacionRepository.countByIdProyectoId(proyectoId);
        if (inscritos >= proyecto.getCupoMaximo()) {
            throw new CupoLlenoException(
                    "El proyecto \"" + proyecto.getTitulo() + "\" no tiene cupos disponibles.");
        }

        AsignacionId id = new AsignacionId(alumno.getId(), proyectoId);
        Asignacion asignacion = new Asignacion(id, alumno, proyecto);
        Asignacion guardada = asignacionRepository.save(asignacion);
        return asignacionMapper.toDTO(guardada);
    }
}
