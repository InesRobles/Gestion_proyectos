package com.example.backend.repositories;

import com.example.backend.models.Proyecto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProyectoRepository extends JpaRepository<Proyecto, Long> {

    // Proyectos en los que el alumno SÍ está inscrito, filtrados por estado
    List<Proyecto> findByAsignaciones_AlumnoIdAndEstadoIn(Long alumnoId, List<String> estados);

    // Proyectos en los que el alumno NO está inscrito
    @Query("SELECT p FROM Proyecto p WHERE p.id NOT IN (" +
            "  SELECT a.proyecto.id FROM Asignacion a WHERE a.alumno.id = :alumnoId" +
            ")")
    List<Proyecto> findByAsignaciones_AlumnoIdNotContaining(@Param("alumnoId") Long alumnoId);
}