package com.example.backend.services;

import com.example.backend.dto.ModalidadesDTO;
import com.example.backend.mapper.ModalidadesMapper;
import com.example.backend.repositories.ModalidadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ModalidadService {

    @Autowired
    private ModalidadRepository modalidadesRepository;

    @Autowired
    private ModalidadesMapper modalidadesMapper;

    public List<ModalidadesDTO> findAll() {
        return modalidadesRepository.findAll()
                .stream()
                .map(modalidadesMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<ModalidadesDTO> findById(Long id) {
        return modalidadesRepository.findById(id)
                .map(modalidadesMapper::toDTO);
    }
}