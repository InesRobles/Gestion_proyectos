package com.example.backend.repositories;

import com.example.backend.models.Comentario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComentarioRepository extends JpaRepository<Comentario,Long> {

    List<Comentario> findByUsuarioId(Long usuarioId);
}
