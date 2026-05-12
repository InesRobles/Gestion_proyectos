package com.example.backend.dto;

import com.example.backend.models.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class ProyectoDTO {

    private Long id;

    private String titulo;

    private String descripcion;

    private Integer cupoMaximo;

    private EstadoProyecto estado;
}
