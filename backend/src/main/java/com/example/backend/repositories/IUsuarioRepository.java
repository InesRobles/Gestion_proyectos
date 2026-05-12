// IUsuarioRepository.java
package com.example.backend.repositories;

import com.example.backend.models.Usuarios;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IUsuarioRepository extends JpaRepository<Usuarios, Long> {
    Optional<Usuarios> findByNombreReal(String nombreReal);
    boolean existsByNombreReal(String nombreReal);
}