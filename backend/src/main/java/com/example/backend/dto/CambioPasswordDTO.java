package com.example.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CambioPasswordDTO {
    private String contrasenaActual;
    private String contrasenaNueva;
}