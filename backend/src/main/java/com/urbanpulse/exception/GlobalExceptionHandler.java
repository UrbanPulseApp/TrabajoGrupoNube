package com.urbanpulse.exception;

import com.urbanpulse.dto.ApiError;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
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

    @ExceptionHandler({IllegalArgumentException.class, MethodArgumentTypeMismatchException.class,
            HttpMessageNotReadableException.class})
    public ResponseEntity<ApiError> handleBadRequest(Exception ex, HttpServletRequest request) {
        String detail = "La solicitud contiene un parámetro o valor no válido.";
        if (ex instanceof IllegalArgumentException && ex.getMessage() != null) {
            detail = ex.getMessage();
        }
        return build(HttpStatus.BAD_REQUEST, "BAD_REQUEST", "Invalid request", detail, request, null);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiError> handleUploadTooLarge(MaxUploadSizeExceededException ex,
                                                         HttpServletRequest request) {
        return build(HttpStatus.PAYLOAD_TOO_LARGE, "FILE_TOO_LARGE", "File too large",
                "El archivo supera el máximo permitido de 10 MB.", request, null);
    }

    @ExceptionHandler({MissingServletRequestParameterException.class, MissingServletRequestPartException.class})
    public ResponseEntity<ApiError> handleMissingInput(Exception ex, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, "MISSING_INPUT", "Missing request input",
                "Falta un parámetro o archivo obligatorio en la solicitud.", request, null);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiError> handleUnsupportedMediaType(HttpMediaTypeNotSupportedException ex,
                                                                HttpServletRequest request) {
        return build(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "UNSUPPORTED_MEDIA_TYPE", "Unsupported media type",
                "El formato de la solicitud no está soportado por este recurso.", request, null);
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
        // 1. Generar un único ID de petición para mantener la coherencia
        String requestId = ApiError.newRequestId();

        ApiError error = new ApiError();
        error.setType("https://api.urbanpulse.com/problems/" + code.toLowerCase());
        error.setTitle(title);
        error.setStatus(status.value());
        error.setCode(code);
        error.setDetail(detail);
        error.setInstance(request.getRequestURI());
        error.setRequestId(requestId);
        error.setErrors(errors);

        // 2. Crear las cabeceras HTTP e incluir X-Request-ID (Requisito de aceptación)
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-Request-ID", requestId);

        // 3. Devolver la respuesta HTTP con status, cabeceras y cuerpo JSON
        return ResponseEntity.status(status).headers(headers).body(error);
    }
}
