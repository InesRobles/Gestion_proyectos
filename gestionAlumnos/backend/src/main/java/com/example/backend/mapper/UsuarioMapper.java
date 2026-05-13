package com.example.backend.mapper;

import com.example.backend.dto.UsuarioDTO;
import com.example.backend.models.Usuario;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {

    Usuario toEntity (UsuarioDTO usuarioDTO);

    UsuarioDTO toDTO (Usuario usuario);

    List<UsuarioDTO> toDTO (List<Usuario> usuario);

    List<Usuario> toEntity (List<UsuarioDTO> usuarioDTO);
}
