package com.example.backend.services;

import com.example.backend.dto.HorarioDTO;
import com.example.backend.mapper.HorarioMapper;
import com.example.backend.models.Horario;
import com.example.backend.repositories.HorarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HorarioService {

    private final HorarioRepository horariosRepository;
    private final HorarioMapper horarioMapper;

    public List<HorarioDTO> findAll() {
        List<Horario> horario = horariosRepository.findAll();
        return horarioMapper.toDTO(horario);
    }

    public Optional<HorarioDTO> findById(Long id) {
        return horariosRepository.findById(id)
                .map(horarioMapper::toDTO);
    }

    public List<HorarioDTO> findByAlumnoId(Long alumnoId) {
        return horariosRepository.findByAlumnoIdId(alumnoId).stream()
                .map(horarioMapper::toDTO)
                .collect(Collectors.toList());
    }

    public HorarioDTO save(HorarioDTO horarioDTO) {
        Horario horario = horarioMapper.toEntity(horarioDTO);
        Horario guardado = horariosRepository.save(horario);
        return horarioMapper.toDTO(guardado);
    }

    public void deleteById(Long id) {
        horariosRepository.deleteById(id);
    }
}