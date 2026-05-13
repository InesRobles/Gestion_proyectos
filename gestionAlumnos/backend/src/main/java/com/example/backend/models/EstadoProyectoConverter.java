package com.example.backend.models;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class EstadoProyectoConverter implements AttributeConverter<EstadoProyecto, String> {

    @Override
    public String convertToDatabaseColumn(EstadoProyecto attribute) {
        return (attribute == null) ? null : attribute.getValor();
    }

    @Override
    public EstadoProyecto convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;

        // Buscamos el enum que coincida con el texto de la DB ('en curso', etc.)
        for (EstadoProyecto ep : EstadoProyecto.values()) {
            if (ep.getValor().equals(dbData)) {
                return ep;
            }
        }
        throw new IllegalArgumentException("Valor de estado desconocido en DB: " + dbData);
    }
}