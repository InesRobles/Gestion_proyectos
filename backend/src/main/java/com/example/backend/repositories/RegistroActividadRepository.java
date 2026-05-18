package com.example.backend.repositories;

import com.example.backend.models.RegistroActividad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RegistroActividadRepository extends JpaRepository<RegistroActividad, Integer> {

    List<RegistroActividad> findByFechaOrderByHoraDesc(LocalDate fecha);

    List<RegistroActividad> findByUsuarioIdAndFecha(Integer usuarioId, LocalDate fecha);
}