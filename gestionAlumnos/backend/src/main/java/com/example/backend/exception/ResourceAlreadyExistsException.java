package com.example.backend.exception;

public class ResourceAlreadyExistsException extends RuntimeException {
    public ResourceAlreadyExistsException(String mensaje) {
        super(mensaje);
    }
}