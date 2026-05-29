package com.example.backend.mapper;

import com.example.backend.dto.ProyectoImagenDTO;
import com.example.backend.models.ProyectoImagen;
import org.mapstruct.Mapper;

import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring")
public interface ProyectoImagenMapper {

    ProyectoImagen toEntity(ProyectoImagenDTO dto);

    ProyectoImagenDTO toDTO(ProyectoImagen entity);

    Set<ProyectoImagen> toEntitySet(Set<ProyectoImagenDTO> dtoList);

    Set<ProyectoImagenDTO> toDTOSet(Set<ProyectoImagen> entityList);
}
