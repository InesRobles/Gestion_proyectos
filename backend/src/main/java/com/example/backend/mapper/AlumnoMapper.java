package com.example.backend.mapper;

import com.example.backend.dto.AlumnoDTO;
import com.example.backend.models.Alumno;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AlumnoMapper {

    @Mapping(source = "usuario.id", target = "usuarioId")
    @Mapping(source = "modalidad.id", target = "modalidad")
    AlumnoDTO toDTO(Alumno alumno);

    @Mapping(source = "usuarioId", target = "usuario.id")
    @Mapping(source = "modalidad", target = "modalidad.id")
    Alumno toEntity(AlumnoDTO alumnoDTO);
}