package com.example.backend.repositories;

import com.example.backend.models.Asignacion;
import com.example.backend.models.AsignacionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AsignacionRepository extends JpaRepository<Asignacion, AsignacionId> {
}
