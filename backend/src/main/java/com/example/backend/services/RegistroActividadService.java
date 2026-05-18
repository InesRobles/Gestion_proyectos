package com.example.backend.services;

import com.example.backend.dto.RegistroActividadDTO;
import com.example.backend.models.RegistroActividad;
import com.example.backend.repositories.RegistroActividadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RegistroActividadService {

    private final RegistroActividadRepository registroActividadRepository;

    public RegistroActividad registrar(RegistroActividadDTO dto) {
        RegistroActividad registro = new RegistroActividad();
        registro.setUsuarioId(dto.getUsuarioId());
        registro.setFecha(LocalDate.now());
        registro.setHora(LocalTime.parse(dto.getHora()));
        registro.setRespondido(dto.getRespondido());
        return registroActividadRepository.save(registro);
    }

    public List<RegistroActividad> getHoy() {
        return registroActividadRepository.findByFechaOrderByHoraDesc(LocalDate.now());
    }

    public List<RegistroActividad> getPorUsuarioYFecha(Integer usuarioId, String fecha) {
        return registroActividadRepository.findByUsuarioIdAndFecha(
                usuarioId, LocalDate.parse(fecha)
        );
    }
}