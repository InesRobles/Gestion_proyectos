package com.example.backend.mapper;

import com.example.backend.dto.ComentarioDTO;
import com.example.backend.models.Comentario;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ComentarioMapper {

    Comentario toEntity (ComentarioDTO comentarioDTO);

    ComentarioDTO toDTO (Comentario comentario);

    List<ComentarioDTO> toDTO (List<Comentario> comentario);

    List<Comentario> toEntity (List<ComentarioDTO> comentarioDTO);
}
