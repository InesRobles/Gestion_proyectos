package com.example.backend.dto;

import com.example.backend.models.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class AsistenciaDTO {

    private Long id;

    private Long alumnoId;

    private LocalDate fecha = LocalDate.now();

    private Boolean presente = false;
}
