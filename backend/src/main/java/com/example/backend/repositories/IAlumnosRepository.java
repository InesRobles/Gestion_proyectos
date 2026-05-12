// IUsuarioRepository.java
package com.example.backend.repositories;

import com.example.backend.models.Alumnos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IAlumnosRepository extends JpaRepository<Alumnos, Long> {
    Optional<Alumnos> findByNombreReal(String nombreReal);
    boolean existsByNombreReal(String nombreReal);
}