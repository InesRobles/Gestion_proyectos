package com.example.backend.repositories;

import com.example.backend.models.ProyectoImagen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProyectoImagenRepository extends JpaRepository<ProyectoImagen, Long> {
    List<ProyectoImagen> findByProyectoId(Long proyectoId);
}
