package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AsignacionDTO {

    private Integer alumnoId;
    private Integer proyectoId;

    // Datos extra útiles para mostrar en el frontend
    private String nombreAlumno;
    private String tituloProyecto;
}
