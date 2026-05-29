package com.example.backend.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "asignacion")
public class Asignacion {

    @EmbeddedId
    private AsignacionId id;

    @ManyToOne
    @MapsId("alumnoId")
    @JoinColumn(name = "alumno_id", insertable = false, updatable = false)
    private Alumno alumno;

    @ManyToOne
    @MapsId("proyectoId")
    @JoinColumn(name = "proyecto_id", insertable = false, updatable = false)
    private Proyecto proyecto;

    @Column(nullable = false, length = 20)
    private String rol = "lector";

    public Asignacion(AsignacionId id, Alumno alumno, Proyecto proyecto) {
        this.id = id;
        this.alumno = alumno;
        this.proyecto = proyecto;
        this.rol = "lector";
    }
}