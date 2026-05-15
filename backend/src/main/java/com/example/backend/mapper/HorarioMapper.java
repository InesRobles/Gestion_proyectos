package com.example.backend.mapper;

import com.example.backend.dto.HorarioDTO;
import com.example.backend.models.Alumno;
import com.example.backend.models.Horario;
import com.example.backend.repositories.AlumnoRepository;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Mapper(componentModel = "spring")
public abstract class HorarioMapper {

    @Autowired
    private AlumnoRepository alumnoRepository;

    @Mapping(source = "alumnoId", target = "alumnoId", qualifiedByName = "idToAlumno")
    public abstract Horario toEntity(HorarioDTO horarioDTO);

    @Mapping(source = "alumnoId.id", target = "alumnoId")
    public abstract HorarioDTO toDTO(Horario horario);

    public abstract List<HorarioDTO> toDTO(List<Horario> horario);

    public abstract List<Horario> toEntity(List<HorarioDTO> horarioDTO);

    @Named("idToAlumno")
    protected Alumno idToAlumno(Long id) {
        if (id == null) return null;
        return alumnoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado con id: " + id));
    }
}