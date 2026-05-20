package com.example.backend.repositories;

import com.example.backend.models.TareaCompletada;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TareaCompletadaRepository extends JpaRepository<TareaCompletada, Long> {

    List<TareaCompletada> findByAlumnoId(Long alumnoId);

    Optional<TareaCompletada> findByTareaIdAndAlumnoId(Long tareaId, Long alumnoId);

    long countByTareaIdAndCompletadaTrue(Long tareaId);
}