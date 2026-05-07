package com.example.backend.services;

import com.example.backend.dto.HorariosDTO;
import com.example.backend.mapper.HorariosMapper;
import com.example.backend.models.Horarios;
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
    private final HorariosMapper horariosMapper;

    public List<HorariosDTO> findAll() {
        List<Horarios> horarios = horariosRepository.findAll();
        return horariosMapper.toDTO(horarios);
    }

    public Optional<HorariosDTO> findById(Long id) {
        return horariosRepository.findById(id)
                .map(horariosMapper::toDTO);
    }

    public List<HorariosDTO> findByAlumnoId(Long alumnoId) {
        return horariosRepository.findByAlumnoIdId(alumnoId).stream()
                .map(horariosMapper::toDTO)
                .collect(Collectors.toList());
    }

    public HorariosDTO save(HorariosDTO horariosDTO) {
        Horarios horario = horariosMapper.toEntity(horariosDTO);
        Horarios guardado = horariosRepository.save(horario);
        return horariosMapper.toDTO(guardado);
    }

    public void deleteById(Long id) {
        horariosRepository.deleteById(id);
    }
}