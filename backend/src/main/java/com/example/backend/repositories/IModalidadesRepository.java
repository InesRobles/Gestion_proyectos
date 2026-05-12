// IUsuarioRepository.java
package com.example.backend.repositories;

import com.example.backend.models.Modalidades;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IModalidadesRepository extends JpaRepository<Modalidades, Long> {
    Optional<Modalidades> findByNombreReal(String nombreReal);
    boolean existsByNombreReal(String nombreReal);
}