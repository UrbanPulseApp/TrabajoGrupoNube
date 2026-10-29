package com.urbanpulse.external.location;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationContext {
    private String address;
    private String district;
    private String neighborhood;
    private Double latitude;
    private Double longitude;
    private Double precisionMeters;
}