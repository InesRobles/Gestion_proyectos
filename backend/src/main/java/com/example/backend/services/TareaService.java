package com.example.backend.services;

import com.example.backend.dto.TareaProyectoDTO;
import com.example.backend.exception.ElementoNoEncontradoException;
import com.example.backend.models.*;
import com.example.backend.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TareaService {

    private final TareaProyectoRepository   tareaRepo;
    private final TareaCompletadaRepository completadaRepo;
    private final ProyectoRepository        proyectoRepo;
    private final AlumnoRepository          alumnoRepo;

    // ─── ADMIN: CRUD de tareas de un proyecto ────────────────────────────────

    /** Devuelve la lista de tareas del proyecto (sin estado de completado) */
    public List<TareaProyectoDTO> getTareasPorProyecto(Long proyectoId) {
        return tareaRepo.findByProyectoIdOrderByOrdenAsc(proyectoId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /** Reemplaza por completo la lista de tareas del proyecto */
    @Transactional
    public List<TareaProyectoDTO> guardarTareas(Long proyectoId, List<String> titulos) {
        Proyecto proyecto = proyectoRepo.findById(proyectoId)
                .orElseThrow(() -> new ElementoNoEncontradoException("Proyecto no encontrado: " + proyectoId));

        // Borramos las existentes (CASCADE borra también tarea_completada)
        tareaRepo.deleteByProyectoId(proyectoId);
        tareaRepo.flush();

        // Creamos las nuevas en orden
        List<TareaProyecto> nuevas = new java.util.ArrayList<>();
        for (int i = 0; i < titulos.size(); i++) {
            String t = titulos.get(i).trim();
            if (t.isEmpty()) continue;
            TareaProyecto tp = new TareaProyecto();
            tp.setProyecto(proyecto);
            tp.setTitulo(t);
            tp.setOrden(i);
            nuevas.add(tareaRepo.save(tp));
        }
        return nuevas.stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ─── ALUMNO: consultar tareas con su estado de completado ────────────────

    /**
     * Devuelve las tareas del proyecto con el campo `completada`
     * relleno según el estado del alumno identificado por usuarioId.
     */
    public List<TareaProyectoDTO> getTareasConEstado(Long proyectoId, Long usuarioId) {
        Alumno alumno = alumnoRepo.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ElementoNoEncontradoException(
                        "Alumno no encontrado para el usuario: " + usuarioId));

        List<TareaProyecto> tareas = tareaRepo.findByProyectoIdOrderByOrdenAsc(proyectoId);

        // Set de IDs completadas por este alumno
        Set<Long> completadas = completadaRepo.findByAlumnoId(alumno.getId())
                .stream()
                .filter(TareaCompletada::getCompletada)
                .map(tc -> tc.getTarea().getId())
                .collect(Collectors.toSet());

        return tareas.stream()
                .map(t -> {
                    TareaProyectoDTO dto = toDTO(t);
                    dto.setCompletada(completadas.contains(t.getId()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // ─── ALUMNO: marcar / desmarcar tarea ────────────────────────────────────

    @Transactional
    public void toggleTarea(Long tareaId, Long usuarioId, boolean completada) {
        Alumno alumno = alumnoRepo.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ElementoNoEncontradoException(
                        "Alumno no encontrado para el usuario: " + usuarioId));

        TareaProyecto tarea = tareaRepo.findById(tareaId)
                .orElseThrow(() -> new ElementoNoEncontradoException("Tarea no encontrada: " + tareaId));

        TareaCompletada tc = completadaRepo
                .findByTareaIdAndAlumnoId(tareaId, alumno.getId())
                .orElseGet(() -> {
                    TareaCompletada nuevo = new TareaCompletada();
                    nuevo.setTarea(tarea);
                    nuevo.setAlumno(alumno);
                    return nuevo;
                });

        tc.setCompletada(completada);
        completadaRepo.save(tc);
    }

    // ─── Mapper ──────────────────────────────────────────────────────────────
    private TareaProyectoDTO toDTO(TareaProyecto t) {
        return new TareaProyectoDTO(
                t.getId(),
                t.getProyecto().getId(),
                t.getTitulo(),
                t.getOrden(),
                null   // completada se rellena sólo cuando el alumno consulta
        );
    }
}