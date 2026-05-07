package com.example.backend.mapper;

import com.example.backend.dto.HorarioDTO;
import com.example.backend.models.Horario;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface HorarioMapper {

    Horario toEntity (HorarioDTO horarioDTO);

    HorarioDTO toDTO (Horario horario);

    List<HorarioDTO> toDTO (List<Horario> horario);

    List<Horario> toEntity (List<HorarioDTO> horarioDTO);
}
