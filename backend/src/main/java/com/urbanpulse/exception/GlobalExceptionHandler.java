package com.urbanpulse.exception;

import com.urbanpulse.dto.ApiError;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.stream.Collectors;

// Manejo centralizado de excepciones (ADR-005). Todas las respuestas de error
// respetan el contrato unificado ApiError y nunca exponen trazas internas.
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex,
                                                   HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, "NOT_FOUND", "Resource not found",
                ex.getMessage(), request, null);
    }

    @ExceptionHandler(InvalidTransitionException.class)
    public ResponseEntity<ApiError> handleInvalidTransition(InvalidTransitionException ex,
                                                            HttpServletRequest request) {
        return build(HttpStatus.UNPROCESSABLE_ENTITY, "INVALID_TRANSITION",
                "Invalid state transition", ex.getMessage(), request, null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex,
                                                     HttpServletRequest request) {
        List<ApiError.FieldError> fieldErrors = ex.getBindingResult().getFieldErrors()
                .stream()
                .map(this::toFieldError)
                .collect(Collectors.toList());

        return build(HttpStatus.UNPROCESSABLE_ENTITY, "VALIDATION_ERROR",
                "Validation failed", "One or more fields contain invalid values.",
                request, fieldErrors);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex,
                                                  HttpServletRequest request) {
        // No se expone la excepción interna al cliente.
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR",
                "Internal server error", "An unexpected error occurred.",
                request, null);
    }

    private ApiError.FieldError toFieldError(FieldError error) {
        return new ApiError.FieldError(
                error.getField(),
                "INVALID_FIELD",
                error.getDefaultMessage());
    }

    private ResponseEntity<ApiError> build(HttpStatus status, String code, String title,
                                           String detail, HttpServletRequest request,
                                           List<ApiError.FieldError> errors) {
        ApiError error = new ApiError();
        error.setType("https://api.urbanpulse.com/problems/" + code.toLowerCase());
        error.setTitle(title);
        error.setStatus(status.value());
        error.setCode(code);
        error.setDetail(detail);
        error.setInstance(request.getRequestURI());
        error.setRequestId(ApiError.newRequestId());
        error.setErrors(errors);

        return ResponseEntity.status(status).body(error);
    }
}
