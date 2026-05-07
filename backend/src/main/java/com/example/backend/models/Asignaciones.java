package com.example.backend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "asignaciones")
public class Asignaciones {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private AsignacionesId id;

    @ManyToOne
    @MapsId("alumnoId")
    @JoinColumn(name = "alumno_id", insertable = false, updatable = false)
    private Alumno alumno;

    @ManyToOne
    @MapsId("proyectoId")
    @JoinColumn(name = "proyecto_id", insertable = false, updatable = false)
    private Proyectos proyecto;
}