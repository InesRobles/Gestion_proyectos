package com.example.backend.repositories;

import com.example.backend.models.Proyectos;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProyectoRepository extends JpaRepository<Proyectos, Long> {
}
