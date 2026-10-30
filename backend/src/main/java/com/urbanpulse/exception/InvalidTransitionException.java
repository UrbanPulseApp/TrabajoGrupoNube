package com.urbanpulse.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Se lanza cuando se intenta una transición de estado no permitida (RF12).
@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class InvalidTransitionException extends RuntimeException {

    public InvalidTransitionException(String message) {
        super(message);
    }
}
