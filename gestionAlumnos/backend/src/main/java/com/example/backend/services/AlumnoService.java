package com.example.backend.services;

import com.example.backend.dto.AlumnoDTO;
import com.example.backend.mapper.AlumnoMapper;
import com.example.backend.repositories.AlumnoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlumnoService {

    @Autowired
    private AlumnoRepository alumnoRepository;

    @Autowired
    private AlumnoMapper alumnoMapper;

    public List<AlumnoDTO> obtenerTodos() {
        return alumnoRepository.findAll()
                .stream()
                .map(alumnoMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<AlumnoDTO> obtenerPorId(Long id) {
        return alumnoRepository.findById(id)
                .map(alumnoMapper::toDTO);
    }

    public com.example.backend.models.Alumno crearPerfilParaUsuario(com.example.backend.models.Usuario usuario) {
        com.example.backend.models.Alumno alumno = new com.example.backend.models.Alumno();
        alumno.setUsuario(usuario);
        return alumnoRepository.save(alumno);
    }
}