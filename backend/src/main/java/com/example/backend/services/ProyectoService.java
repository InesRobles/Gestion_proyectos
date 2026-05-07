package com.example.backend.services;

import com.example.backend.dto.ProyectoDTO;
import com.example.backend.mapper.ProyectoMapper;
import com.example.backend.repositories.ProyectoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProyectoService {

    @Autowired
    private ProyectoRepository proyectoRepository;

    @Autowired
    private ProyectoMapper proyectoMapper;

    public List<ProyectoDTO> findAll() {
        return proyectoRepository.findAll().stream().map(proyectoMapper::toDTO).collect(Collectors.toList());
    }

    public Optional<ProyectoDTO> findById(Long id) {
        return proyectoRepository.findById(id).map(proyectoMapper::toDTO);
    }
}
