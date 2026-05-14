package com.example.backend.mapper;

import com.example.backend.dto.ProyectoDTO;
import com.example.backend.models.Proyecto;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProyectoMapper {

    Proyecto toEntity (ProyectoDTO proyectoDTO);

    ProyectoDTO toDTO (Proyecto proyecto);

    List<ProyectoDTO> toDTO (List<Proyecto> proyecto);

    List<Proyecto> toEntity (List<ProyectoDTO> proyectoDTO);
}
