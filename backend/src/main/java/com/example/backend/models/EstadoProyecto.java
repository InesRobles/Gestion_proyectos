package com.example.backend.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;


public enum EstadoProyecto {
    EN_CURSO("en curso"),
    FINALIZADO("finalizado"),
    PAUSADO("pausado");

    private String valor;
    EstadoProyecto(String valor) { this.valor = valor; }

    @JsonValue
    public String getValor() { return valor; }
}