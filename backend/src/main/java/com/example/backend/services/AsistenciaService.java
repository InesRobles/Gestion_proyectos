package com.example.backend.services;

import com.example.backend.dto.AsistenciaDTO;
import com.example.backend.mapper.AsistenciaMapper;
import com.example.backend.repositories.AsistenciaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
}