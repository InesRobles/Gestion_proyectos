package com.example.backend.dto;

import com.example.backend.models.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UsuarioDTO {

    private Long id;

    private String nombreUsuario;

    private String contrasenaHash;

    private Rol rol;

    private String nombreReal;

    private String fotoUsuario;

    private Long modalidadId;

    private String modalidadNombre;
}