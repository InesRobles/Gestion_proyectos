package com.example.backend.services;

import com.example.backend.dto.ModalidadesDTO;
import com.example.backend.exception.ElementoNoEncontradoException;
import com.example.backend.exception.ResourceAlreadyExistsException;
import com.example.backend.mapper.ModalidadesMapper;
import com.example.backend.models.Modalidades;

import com.example.backend.repositories.IModalidadesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ModalidadesService {

    private final IModalidadesRepository modalidadesRepository;
    private final ModalidadesMapper modalidadesMapper;


    // ── CREATE ──────────────────────────────────────────────
    public ModalidadesDTO crearModalidad(ModalidadesDTO modalidadesDTO) {
        Optional<Modalidades> existingByNombreReal = modalidadesRepository.findByNombreReal(modalidadesDTO.getNombre());
       /* if () {
            Aqui iria una excepcion
        } */

        Modalidades modalidad = modalidadesMapper.toEntity(modalidadesDTO);

        Modalidades modalidadGuardada = modalidadesRepository.save(modalidad);
        return modalidadesMapper.toDTO(modalidadGuardada);
    }

    // ── READ (por ID) ────────────────────────────────────────
    public ModalidadesDTO buscarModalidadPorId(Long id) {
        Modalidades modalidad = modalidadesRepository.findById(id)
                .orElseThrow(() -> new ElementoNoEncontradoException("Modalidad no encontrada con id: " + id));  //Dejo la excepcion porque si no, no funciona "findById"

        return modalidadesMapper.toDTO(modalidad);
    }

    // ── READ (por nombre) ────────────────────────────────────
    public ModalidadesDTO buscarModalidadPorNombre(String nombreReal) {
        Modalidades modalidad = modalidadesRepository.findByNombreReal(nombreReal)
                .orElseThrow(() -> new ElementoNoEncontradoException("Modalidad no encontrada con nombre: " + nombreReal)); //Dejo la excepcion porque si no, no funciona "findById"
        return modalidadesMapper.toDTO(modalidad);
    }

    // ── READ (todos) ─────────────────────────────────────────
    public List<ModalidadesDTO> obtenerTodasLasModalidades() {
        List<Modalidades> modalidades = modalidadesRepository.findAll();
        return modalidadesMapper.toDTO(modalidades);
    }

    // ── UPDATE ───────────────────────────────────────────────
    public ModalidadesDTO actualizarModalidad(Long id, ModalidadesDTO modalidadesDTO) {
        Modalidades modalidad = modalidadesRepository.findById(id)
                .orElseThrow(() -> new ElementoNoEncontradoException("Modalidad no encontrada con id: " + id));   //Dejo la excepcion porque si no, no funciona "findById"

        /*if () {
           Aquí iria una excepcion
            });
        }*/

        modalidad.setNombre(modalidadesDTO.getNombre());

        Modalidades modalidadActualizada = modalidadesRepository.save(modalidad);
        return modalidadesMapper.toDTO(modalidadActualizada);
    }

    // ── DELETE ───────────────────────────────────────────────
    public void eliminarModalidad(Long id) {
        if (!modalidadesRepository.existsById(id)) {
            throw new ElementoNoEncontradoException("Usuario no encontrado con id: " + id);
        }
        modalidadesRepository.deleteById(id);
    }
}