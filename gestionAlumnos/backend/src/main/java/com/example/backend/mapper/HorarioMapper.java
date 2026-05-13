package com.example.backend.mapper;

import com.example.backend.dto.HorarioDTO;
import com.example.backend.models.Horario;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping; // Necesitas esta importación

import java.util.List;

@Mapper(componentModel = "spring")
public interface HorarioMapper {

    @Mapping(target = "alumnoId", ignore = true)
    Horario toEntity (HorarioDTO horarioDTO);

    @Mapping(source = "alumnoId.id", target = "alumnoId")
    HorarioDTO toDTO (Horario horario);

    List<HorarioDTO> toDTO (List<Horario> horario);

    List<Horario> toEntity (List<HorarioDTO> horarioDTO);
}