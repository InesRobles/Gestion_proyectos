package com.example.backend.models;

import com.fasterxml.jackson.annotation.JsonProperty;


public enum EstadoProyecto {
    @JsonProperty("en curso")
    en_curso,
    finalizado,
    pausado

}
