package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class HorarioDTO {

    private Long id;

    private Long alumnoId;

    private String diaSemana;

    private String horaInicio;

    private String horaFin;
}
