// UsuarioRepository.java
package com.example.backend.repositories;

import com.example.backend.models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByNombreReal(String nombreReal);
    boolean existsByNombreReal(String nombreReal);
}