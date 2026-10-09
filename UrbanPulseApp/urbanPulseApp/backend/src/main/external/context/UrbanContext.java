package external.context;

import java.util.Collections;
import java.util.List;

public class UrbanContext {
    private final String weatherCondition;
    private final Double temperatureCelsius;
    private final String trafficLevel;
    private final List<ExternalObservation> observations;

    public UrbanContext(String weatherCondition, Double temperatureCelsius, String trafficLevel, List<ExternalObservation> observations) {
        this.weatherCondition = weatherCondition;
        this.temperatureCelsius = temperatureCelsius;
        this.trafficLevel = trafficLevel;
        this.observations = observations;
    }

    public String getWeatherCondition() { return weatherCondition; }
    public Double getTemperatureCelsius() { return temperatureCelsius; }
    public String getTrafficLevel() { return trafficLevel; }
    public List<ExternalObservation> getObservations() { return observations; }

    public static UrbanContext empty() {
        return new UrbanContext("No disponible", 0.0, "Desconocido", Collections.emptyList());
    }
}