package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class ComentarioDTO {

    private Long id;

    private Long proyectoId;

    private Long usuarioId;

    private String texto;

    private LocalDateTime fecha = LocalDateTime.now();
}
