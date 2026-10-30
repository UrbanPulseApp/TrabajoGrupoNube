package com.urbanpulse.external.service;

import com.urbanpulse.external.location.LocationContext;

public interface GeoLocationService {

    LocationContext getLocationContext(Double latitude, Double longitude);
}