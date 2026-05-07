package com.example.backend.mapper;

import com.example.backend.dto.AlumnoDTO;
import com.example.backend.models.Alumno;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AlumnoMapper {

    @Mapping(source = "usuario.id", target = "usuarioId")
    @Mapping(source = "modalidades.id", target = "modalidades")
    AlumnoDTO toDTO(Alumno alumno);

    @Mapping(source = "usuarioId", target = "usuario.id")
    @Mapping(source = "modalidades", target = "modalidades.id")
    Alumno toEntity(AlumnoDTO alumnoDTO);
}