package com.example.backend.services;

import com.example.backend.dto.ModalidadDTO;
import com.example.backend.mapper.ModalidadMapper;
import com.example.backend.models.Modalidad;
import com.example.backend.repositories.AlumnoRepository;
import com.example.backend.repositories.ModalidadRepository;
import com.example.backend.exception.ElementoNoEncontradoException;
import com.example.backend.exception.ResourceAlreadyExistsException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Autowired
    private AlumnoRepository alumnoRepository;

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

    public ModalidadDTO crear(ModalidadDTO dto) {
        if (modalidadRepository.findByNombre(dto.getNombre()).isPresent()) {
            throw new ResourceAlreadyExistsException(
                    "Ya existe una modalidad con el nombre: " + dto.getNombre()
            );
        }
        Modalidad modalidad = new Modalidad();
        modalidad.setNombre(dto.getNombre().trim());
        return modalidadMapper.toDTO(modalidadRepository.save(modalidad));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!modalidadRepository.existsById(id)) {
            throw new ElementoNoEncontradoException("Modalidad no encontrada con id: " + id);
        }

        alumnoRepository.findAll().stream()
                .filter(a -> a.getModalidad() != null && a.getModalidad().getId().equals(id))
                .forEach(a -> {
                    a.setModalidad(null);
                    alumnoRepository.save(a);
                });

        modalidadRepository.deleteById(id);
    }
}