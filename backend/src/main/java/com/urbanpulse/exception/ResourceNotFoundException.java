package com.urbanpulse.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Excepción de dominio para recursos no encontrados (HTTP 404).
// GlobalExceptionHandler la traduce al contrato unificado ApiError (ADR-005).
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}

