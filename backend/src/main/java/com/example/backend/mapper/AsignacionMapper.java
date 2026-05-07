package com.example.backend.mapper;

import com.example.backend.dto.AsignacionDTO;
import com.example.backend.models.Asignacion;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AsignacionMapper {

    Asignacion toEntity (AsignacionDTO asignacionDTO);

    AsignacionDTO toDTO (Asignacion asignacion);

    List<AsignacionDTO> toDTO (List<Asignacion> asignacion);

    List<Asignacion> toEntity (List<AsignacionDTO> asignacionDTO);
}
