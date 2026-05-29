package com.example.backend.repositories;

import com.example.backend.models.ProyectoDocumento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProyectoDocumentoRepository extends JpaRepository<ProyectoDocumento, Long> {
    List<ProyectoDocumento> findByProyectoId(Long proyectoId);
}
