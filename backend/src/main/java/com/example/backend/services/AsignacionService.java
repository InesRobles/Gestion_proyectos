package com.example.backend.services;

import com.example.backend.dto.AsignacionDTO;
import com.example.backend.mapper.AsignacionMapper;
import com.example.backend.models.AsignacionId;
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
    private AsignacionMapper asignacionMapper;

    public List<AsignacionDTO> findAll() {
        return asignacionRepository.findAll()
                .stream()
                .map(asignacionMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<AsignacionDTO> findById(AsignacionId id) {
        return asignacionRepository.findById(id)
                .map(asignacionMapper::toDTO);
    }
}