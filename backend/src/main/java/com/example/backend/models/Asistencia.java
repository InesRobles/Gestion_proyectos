package com.example.backend.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
@EqualsAndHashCode
@ToString
@NoArgsConstructor
@Entity
@Table(name="asistencia", schema = "")

public class Asistencia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "alumno_id")
    private Alumno alumno;

    @Column(name = "fecha")
    private LocalDate fecha = LocalDate.now();

    @Column(nullable = false)
    private Boolean presente = false;

    @Column(name = "hora_entrada")
    private LocalTime horaEntrada;

    @Column(name = "hora_salida")
    private LocalTime horaSalida;

    @Column(name = "estado")
    private String estado;
}
