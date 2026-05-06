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
@Table(name="proyectos", schema = "")

public class Proyectos {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(length = 500)
    private String descripcion;

    @Column(name = "cupo_maximo", nullable = false)
    private Integer cupoMaximo;

    @Column
    private EstadoProyecto estado;

    @OneToMany(mappedBy = "proyecto")
    private Set<Asignaciones> asignaciones = new HashSet<>();
}
