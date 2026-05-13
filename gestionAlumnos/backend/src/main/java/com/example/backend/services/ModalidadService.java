package com.example.backend.services;

import com.example.backend.dto.ModalidadDTO;
import com.example.backend.mapper.ModalidadMapper;
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
    private ModalidadRepository modalidadRepository;

    @Autowired
    private ModalidadMapper modalidadMapper;

    public List<ModalidadDTO> findAll() {
        return modalidadRepository.findAll()
                .stream()
                .map(modalidadMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<ModalidadDTO> findById(Long id) {
        return modalidadRepository.findById(id)
                .map(modalidadMapper::toDTO);
    }
}