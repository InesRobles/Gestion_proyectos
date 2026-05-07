package com.example.backend.exception;

public class ElementoNoEncontradoException extends RuntimeException {
    public ElementoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}