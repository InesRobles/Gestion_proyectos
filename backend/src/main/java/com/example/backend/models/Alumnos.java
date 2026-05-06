package com.example.backend.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@EqualsAndHashCode
@ToString
@NoArgsConstructor
@Entity
@Table(name="alumnos", schema = "")

public class Alumnos {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "usuario_id", unique = true)
    private Usuarios usuario;

    @ManyToOne
    @JoinColumn(name = "modalidad_id")
    private Modalidades modalidades;

    @OneToMany(mappedBy = "alumno")
    private Set<Asignaciones> asignaciones = new HashSet<>();
}
