package com.example.backend.repositories;

import com.example.backend.models.Asignacion;
import com.example.backend.models.AsignacionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AsignacionRepository extends JpaRepository<Asignacion, AsignacionId> {
    long countByIdProyectoId(Long proyectoId);
    boolean existsByIdAlumnoIdAndIdProyectoId(Long alumnoId, Long proyectoId);

    // Devuelve todas las asignaciones de un alumno concreto
    List<Asignacion> findByIdAlumnoId(Long alumnoId);
}
