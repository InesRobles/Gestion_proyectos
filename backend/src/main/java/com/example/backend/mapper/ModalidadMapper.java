package com.example.backend.mapper;

import com.example.backend.dto.ModalidadDTO;
import com.example.backend.models.Modalidad;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ModalidadMapper {

    Modalidad toEntity (ModalidadDTO modalidadDTO);

    ModalidadDTO toDTO (Modalidad modalidad);

    List<ModalidadDTO> toDTO (List<Modalidad> modalidad);

    List<Modalidad> toEntity (List<ModalidadDTO> modalidadDTO);
}
