package com.example.backend.models;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@EqualsAndHashCode
@ToString
@NoArgsConstructor
@Entity
@Table(name="horario", schema = "")

public class Horario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "alumno_id")
    private Alumno alumnoId;

    @Column(name = "dia_semana", nullable = false, length = 20)
    private String diaSemana;

    @Column(name = "hora_inicio", nullable = false, length = 10)
    private String horaInicio;

    @Column(name = "hora_fin", nullable = false, length = 10)
    private String horaFin;
}
