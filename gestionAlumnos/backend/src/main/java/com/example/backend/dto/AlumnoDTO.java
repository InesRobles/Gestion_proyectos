package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class AlumnoDTO {

    private Long id;

    private Long usuarioId;

    private Long modalidad;
}
