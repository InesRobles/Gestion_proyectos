package com.example.backend.models;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum EstadoProyecto {
    EN_CURSO("en curso"),
    FINALIZADO("finalizado"),
    PAUSADO("pausado");

    private final String valor;

    EstadoProyecto(String valor) { this.valor = valor; }

    /** Jackson usa este valor al serializar a JSON (e.g. "en curso") */
    @JsonValue
    public String getValor() { return valor; }

    /** Jackson llama este método al deserializar desde JSON */
    @JsonCreator
    public static EstadoProyecto fromValor(String valor) {
        if (valor == null) return null;
        for (EstadoProyecto ep : values()) {
            if (ep.valor.equalsIgnoreCase(valor)) return ep;
        }
        throw new IllegalArgumentException("Estado desconocido: " + valor);
    }
}