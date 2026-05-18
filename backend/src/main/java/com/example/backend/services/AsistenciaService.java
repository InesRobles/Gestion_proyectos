package com.example.backend.services;

import com.example.backend.dto.AsistenciaDTO;
import com.example.backend.mapper.AsistenciaMapper;
import com.example.backend.models.Asistencia;
import com.example.backend.repositories.AsistenciaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AsistenciaService {

    @Autowired
    private AsistenciaRepository asistenciaRepository;

    @Autowired
    private AsistenciaMapper asistenciaMapper;

    public List<AsistenciaDTO> findAll() {
        return asistenciaRepository.findAll()
                .stream()
                .map(asistenciaMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<AsistenciaDTO> findById(Long id) {
        return asistenciaRepository.findById(id)
                .map(asistenciaMapper::toDTO);
    }

    public AsistenciaDTO registrar(AsistenciaDTO dto) {
        // Si ya fichó hoy, devolver el registro existente sin duplicar
        return asistenciaRepository
                .findByAlumnoIdAndFecha(dto.getAlumnoId(), LocalDate.now())
                .map(asistenciaMapper::toDTO)
                .orElseGet(() -> {
                    Asistencia a = asistenciaMapper.toEntity(dto);
                    a.setFecha(LocalDate.now());
                    a.setPresente(true);
                    a.setHoraEntrada(LocalTime.now());
                    a.setEstado("FICHADO");
                    return asistenciaMapper.toDTO(asistenciaRepository.save(a));
                });
    }

    public AsistenciaDTO registrarSalida(Long alumnoId) {
        Asistencia asistencia = asistenciaRepository
                .findByAlumnoIdAndFecha(alumnoId, LocalDate.now())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No hay fichaje de entrada para hoy"));

        if (asistencia.getHoraSalida() != null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Ya has registrado la salida de hoy");
        }

        asistencia.setHoraSalida(LocalTime.now());
        asistencia.setEstado("TERMINADO");
        return asistenciaMapper.toDTO(asistenciaRepository.save(asistencia));
    }

    public Optional<AsistenciaDTO> findByAlumnoHoy(Long alumnoId) {
        return asistenciaRepository
                .findByAlumnoIdAndFecha(alumnoId, LocalDate.now())
                .map(asistenciaMapper::toDTO);
    }

    public List<AsistenciaDTO> findAllHoy() {
        return asistenciaRepository.findByFecha(LocalDate.now())
                .stream()
                .map(asistenciaMapper::toDTO)
                .collect(Collectors.toList());
    }
}