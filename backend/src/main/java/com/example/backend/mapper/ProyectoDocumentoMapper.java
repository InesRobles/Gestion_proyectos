package com.example.backend.mapper;

import com.example.backend.dto.ProyectoDocumentoDTO;
import com.example.backend.models.ProyectoDocumento;
import org.mapstruct.Mapper;

import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring")
public interface ProyectoDocumentoMapper {

    ProyectoDocumento toEntity(ProyectoDocumentoDTO dto);

    ProyectoDocumentoDTO toDTO(ProyectoDocumento entity);

    Set<ProyectoDocumento> toEntitySet(Set<ProyectoDocumentoDTO> dtoList);

    Set<ProyectoDocumentoDTO> toDTOSet(Set<ProyectoDocumento> entityList);
}
