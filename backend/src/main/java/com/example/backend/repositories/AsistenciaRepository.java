package com.example.backend.repositories;

import com.example.backend.models.Asistencia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AsistenciaRepository extends JpaRepository<Asistencia, Long> {

    Optional<Asistencia> findByAlumnoIdAndFecha(Long alumnoId, LocalDate fecha);

    List<Asistencia> findByFecha(LocalDate fecha);
}