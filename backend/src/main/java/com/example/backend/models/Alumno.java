package com.example.backend.models;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@EqualsAndHashCode
@ToString
@NoArgsConstructor
@Entity
@Table(name="alumno")
public class Alumno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "usuario_id", unique = true, foreignKey = @ForeignKey(name = "fk_alumno_usuario"))
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "modalidad_id")
    private Modalidad modalidad;

    @OneToMany(mappedBy = "alumno", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Asignacion> asignacion = new HashSet<>();

    @OneToMany(mappedBy = "alumno", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Asistencia> asistencias = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "alumnoId", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Horario> horarios = new java.util.ArrayList<>();
}