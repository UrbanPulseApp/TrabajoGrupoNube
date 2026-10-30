package com.urbanpulse.external.adapter;

import com.urbanpulse.external.location.LocationContext;
import com.urbanpulse.external.service.GeoLocationService;
import org.springframework.stereotype.Service;

@Service
public class MockGeoLocationAdapter implements GeoLocationService {

    @Override
    public LocationContext getLocationContext(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            return buildFallbackLocationContext("Coordenadas no proporcionadas (degradación controlada)");
        }

        try {
            String district;
            String neighborhood;
            String address;

            if (latitude >= 36.710 && latitude <= 36.730 && longitude >= -4.430 && longitude <= -4.410) {
                district = "Distrito Centro";
                neighborhood = "Soho / Centro Histórico";
                address = "Calle Larios / Alameda Principal";
            } else if (latitude >= 36.710 && latitude <= 36.735 && longitude >= -4.480 && longitude <= -4.440) {
                district = "Teatinos-Universidad";
                neighborhood = "El Cónsul / Teatinos";
                address = "Bulevar Louis Pasteur";
            } else if (latitude >= 36.690 && latitude <= 36.715 && longitude >= -4.450 && longitude <= -4.420) {
                district = "Carretera de Cádiz";
                neighborhood = "Huelin / La Paz";
                address = "Avenida de Velázquez";
            } else {
                district = "Distrito Málaga Urbano";
                neighborhood = "Zona Urbana";
                address = "Ubicación aproximada en Málaga";
            }

            LocationContext context = new LocationContext();
            context.setLatitude(latitude);
            context.setLongitude(longitude);
            context.setDistrict(district);
            context.setNeighborhood(neighborhood);
            context.setAddress(address);
            context.setPrecisionMeters(15.0);

            return context;

        } catch (Exception e) {
            return buildFallbackLocationContext("Servicio de geolocalización no disponible (degradación controlada)");
        }
    }

    private LocationContext buildFallbackLocationContext(String reason) {
        LocationContext context = new LocationContext();
        context.setDistrict("Desconocido");
        context.setNeighborhood("No disponible");
        context.setAddress(reason);
        context.setPrecisionMeters(0.0);
        return context;
    }
}