package com.example.backend.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class TareaProyectoDTO {
    private Long    id;
    private Long    proyectoId;
    private String  titulo;
    private Integer orden;
    private Boolean completada;
}