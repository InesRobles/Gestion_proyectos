package com.example.backend.mapper;

import com.example.backend.dto.AsistenciaDTO;
import com.example.backend.models.Asistencia;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AsistenciaMapper {

    Asistencia toEntity (AsistenciaDTO asistenciaDTO);

    AsistenciaDTO toDTO (Asistencia asistencia);

    List<AsistenciaDTO> toDTO (List<Asistencia> asistencia);

    List<Asistencia> toEntity (List<AsistenciaDTO> asistenciaDTOS);
}
