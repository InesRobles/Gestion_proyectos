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



    @Column(name = "estado")
    private EstadoProyecto estado;

    @Column(name = "foto_proyecto", columnDefinition = "LONGTEXT")
    private String fotoProyecto;

    @Column(name = "video_url", length = 500)
    private String videoUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creador_id", foreignKey = @ForeignKey(name = "fk_proyecto_creador"))
    private Usuario creador;

    @Column(name = "enlace_github", length = 255)
    private String enlaceGithub;

    @Column(name = "memoria", columnDefinition = "LONGTEXT")
    private String memoria;

    @Column(name = "privado")
    private Boolean privado = false;

    @OneToMany(mappedBy = "proyecto", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProyectoDocumento> documentos = new HashSet<>();

    @OneToMany(mappedBy = "proyecto", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProyectoImagen> imagenes = new HashSet<>();

    @OneToMany(mappedBy = "proyecto", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Asignacion> asignaciones = new HashSet<>();
}