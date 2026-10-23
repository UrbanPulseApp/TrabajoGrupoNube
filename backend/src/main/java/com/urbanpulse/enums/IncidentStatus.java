package com.urbanpulse.enums;

public enum IncidentStatus {

    REPORTED,
    VALIDATED,
    REJECTED,
    ASSIGNED,
    IN_PROGRESS,
    RESOLVED,
    REOPENED,
    CLOSED;

    // Transiciones permitidas del ciclo de vida (RF12).
    public boolean canTransitionTo(IncidentStatus target) {
        if (target == null || target == this) {
            return false;
        }
        switch (this) {
            case REPORTED:
                return target == VALIDATED || target == REJECTED;
            case VALIDATED:
                return target == ASSIGNED || target == REJECTED;
            case ASSIGNED:
                return target == IN_PROGRESS || target == VALIDATED;
            case IN_PROGRESS:
                return target == RESOLVED;
            case RESOLVED:
                return target == CLOSED || target == REOPENED;
            case REOPENED:
                return target == ASSIGNED || target == IN_PROGRESS;
            case REJECTED:
            case CLOSED:
            default:
                return false;
        }
    }
}