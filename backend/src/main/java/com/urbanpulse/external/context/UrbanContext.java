package com.urbanpulse.external.context;

import com.urbanpulse.external.location.LocationContext;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UrbanContext {
    private UUID incidentId;
    private LocationContext locationContext;

    @Builder.Default
    private List<ExternalObservation> observations = new ArrayList<>();

    private String weatherSummary;
    private String trafficStatus;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime capturedAt;
}