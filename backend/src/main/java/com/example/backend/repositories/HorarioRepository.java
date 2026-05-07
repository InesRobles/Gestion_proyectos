package com.example.backend.repositories;

import com.example.backend.models.Horarios;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HorarioRepository extends JpaRepository<Horarios,Long> {
    List<Horarios> findByAlumnoIdId(Long alumnoId);
}
