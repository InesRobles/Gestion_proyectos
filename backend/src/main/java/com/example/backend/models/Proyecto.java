package com.example.backend.models;

import jakarta.persistence.*;
import lombok.*;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@EqualsAndHashCode
@ToString
@NoArgsConstructor
@Entity
@Table(name="proyecto", schema = "")

public class Proyecto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(length = 500)
    private String descripcion;

    @Column(name = "cupo_maximo", nullable = false)
    private Integer cupoMaximo;

    @Column(name = "estado")
    private EstadoProyecto estado;

    @OneToMany(mappedBy = "proyecto")
    private Set<Asignacion> asignaciones = new HashSet<>();
}
