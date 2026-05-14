package com.example.backend.models;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.*;

@Embeddable
@Data @NoArgsConstructor @AllArgsConstructor
public class AsignacionId implements Serializable {
    private Long alumnoId;
    private Long proyectoId;
}