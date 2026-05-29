package com.example.backend.mapper;

import com.example.backend.dto.ProyectoDTO;
import com.example.backend.models.Proyecto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ProyectoDocumentoMapper.class, ProyectoImagenMapper.class})
public interface ProyectoMapper {

    @Mapping(source = "creadorId", target = "creador.id")
    Proyecto toEntity (ProyectoDTO proyectoDTO);

    @Mapping(source = "creador.id", target = "creadorId")
    ProyectoDTO toDTO (Proyecto proyecto);

    List<ProyectoDTO> toDTO (List<Proyecto> proyecto);

    List<Proyecto> toEntity (List<ProyectoDTO> proyectoDTO);
}
