package com.example.backend.dto;

import com.example.backend.models.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class AsistenciaDTO {

    private Long id;

    private Long alumnoId;

    private LocalDate fecha = LocalDate.now();

    private Boolean presente = false;

    private LocalTime horaEntrada;

    private LocalTime horaSalida;

    private String estado;
}