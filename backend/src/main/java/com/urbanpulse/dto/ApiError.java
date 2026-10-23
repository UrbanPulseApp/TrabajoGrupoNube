package com.urbanpulse.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;
import java.util.UUID;

// Contrato unificado de error de la API (ver ADR-005 y docs/api/acuerdo-api.md).
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError {

    private String type;
    private String title;
    private int status;
    private String code;
    private String detail;
    private String instance;
    private String requestId;
    private List<FieldError> errors;

    public ApiError() {
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDetail() {
        return detail;
    }

    public void setDetail(String detail) {
        this.detail = detail;
    }

    public String getInstance() {
        return instance;
    }

    public void setInstance(String instance) {
        this.instance = instance;
    }

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public List<FieldError> getErrors() {
        return errors;
    }

    public void setErrors(List<FieldError> errors) {
        this.errors = errors;
    }

    // Genera un requestId de trazabilidad si el llamante no lo aporta.
    public static String newRequestId() {
        return UUID.randomUUID().toString();
    }

    // Detalle de un campo concreto que falló la validación.
    public static class FieldError {

        private String field;
        private String code;
        private String message;

        public FieldError() {
        }

        public FieldError(String field, String code, String message) {
            this.field = field;
            this.code = code;
            this.message = message;
        }

        public String getField() {
            return field;
        }

        public void setField(String field) {
            this.field = field;
        }

        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
