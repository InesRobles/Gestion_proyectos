package com.example.backend.repositories;

import com.example.backend.models.TareaProyecto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TareaProyectoRepository extends JpaRepository<TareaProyecto, Long> {
    List<TareaProyecto> findByProyectoIdOrderByOrdenAsc(Long proyectoId);
    void deleteByProyectoId(Long proyectoId);
}