package com.example.backend.mapper;

import com.example.backend.dto.AsistenciaDTO;
import com.example.backend.models.Alumno;
import com.example.backend.models.Asistencia;
import com.example.backend.repositories.AlumnoRepository;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Mapper(componentModel = "spring")
public abstract class AsistenciaMapper {

    @Autowired
    private AlumnoRepository alumnoRepository;  // ← inyectar el repositorio

    @Mapping(source = "alumno.id", target = "alumnoId")
    public abstract AsistenciaDTO toDTO(Asistencia asistencia);

    @Mapping(source = "alumnoId", target = "alumno", qualifiedByName = "idToAlumno")
    public abstract Asistencia toEntity(AsistenciaDTO asistenciaDTO);

    public abstract List<AsistenciaDTO> toDTO(List<Asistencia> asistencia);

    public abstract List<Asistencia> toEntity(List<AsistenciaDTO> asistenciaDTOS);

    @Named("idToAlumno")
    protected Alumno idToAlumno(Long alumnoId) {
        if (alumnoId == null) return null;
        return alumnoRepository.findById(alumnoId)
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado con id: " + alumnoId));
        // ↑ igual que HorarioMapper — devuelve la entidad gestionada por JPA
    }
}