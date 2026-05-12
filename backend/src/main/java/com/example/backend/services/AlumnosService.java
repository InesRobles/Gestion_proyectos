package com.example.backend.services;

import com.example.backend.dto.AlumnosDTO;
import com.example.backend.mapper.AlumnosMapper;
import com.example.backend.models.Alumnos;
import com.example.backend.repositories.IAlumnosRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AlumnosService {

    private final IAlumnosRepository alumnosRepository;
    private final AlumnosMapper alumnosMapper;

    // ── CREATE ──────────────────────────────────────────────
    public AlumnosDTO crearAlumnos(AlumnosDTO alumnosDTO) {

        Alumnos alumnos = alumnosMapper.toEntity(alumnosDTO);
        Alumnos alumnosGuardado = alumnosRepository.save(alumnos);
        return alumnosMapper.toDTO(alumnosGuardado);
    }

    /*// ── READ (por ID) ────────────────────────────────────────
    public AlumnosDTO buscarAlumnosPorId(Long id) {
        //Excepción
    }

    // ── READ (por nombre) ────────────────────────────────────
    public AlumnosDTO buscarAlumnosPorNombre(String nombreReal) {
        //Excepción
    }*/

    // ── READ (todos) ─────────────────────────────────────────
    public List<AlumnosDTO> obtenerTodosLosAlumnos() {
        List<Alumnos> alumnos = alumnosRepository.findAll();
        return alumnosMapper.toDTO(alumnos);
    }

    // ── UPDATE ───────────────────────────────────────────────
    public AlumnosDTO actualizarAlumnos(Long id, AlumnosDTO alumnosDTO) {

        alumnos.setNombreReal(alumnosDTO.getNombreReal());
        alumnos.setRol(alumnosDTO.getRol());

        Alumnos alumnosActualizado = alumnosRepository.save(alumnos);
        return alumnosMapper.toDTO(alumnosActualizado);
    }

    // ── DELETE ───────────────────────────────────────────────
    public void eliminarAlumnos(Long id) {
        alumnosRepository.deleteById(id);
    }
}