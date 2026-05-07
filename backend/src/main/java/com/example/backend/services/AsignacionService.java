package com.example.backend.services;

import com.example.backend.dto.AsignacionesDTO;
import com.example.backend.mapper.AsignacionesMapper;
import com.example.backend.models.AsignacionesId;
import com.example.backend.repositories.AsignacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AsignacionService {

    @Autowired
    private AsignacionRepository asignacionRepository;

    @Autowired
    private AsignacionesMapper asignacionesMapper;

    public List<AsignacionesDTO> findAll() {
        return asignacionRepository.findAll()
                .stream()
                .map(asignacionesMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<AsignacionesDTO> findById(AsignacionesId id) {
        return asignacionRepository.findById(id)
                .map(asignacionesMapper::toDTO);
    }
}