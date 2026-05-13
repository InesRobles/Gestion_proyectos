package com.example.backend.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor

public class CupoLlenoException extends RuntimeException {
    public CupoLlenoException(String message) {
        super(message);
    }
}