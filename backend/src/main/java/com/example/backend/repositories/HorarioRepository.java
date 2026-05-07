package com.example.backend.repositories;

import com.example.backend.models.Horario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HorarioRepository extends JpaRepository<Horario,Long> {
    List<Horario> findByAlumnoIdId(Long alumnoId);
}
