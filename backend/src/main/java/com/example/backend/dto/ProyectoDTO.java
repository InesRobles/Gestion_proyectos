package com.example.backend.dto;

import com.example.backend.models.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor

public class ProyectoDTO {

    private Long id;

    private String titulo;

    private String descripcion;
    private List<UsuarioDTO> alumnos;



    private EstadoProyecto estado;

    private String fotoProyecto;

    private String videoUrl;

    private Long creadorId;

    private String enlaceGithub;

    private String memoria;

    private Boolean privado;

    private java.util.Set<ProyectoDocumentoDTO> documentos;

    private java.util.Set<ProyectoImagenDTO> imagenes;
}