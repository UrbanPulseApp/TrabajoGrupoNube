package external.location;

public class LocationContext {
    private final String district;
    private final String neighborhood;
    private final String normalizedAddress;

    public LocationContext(String district, String neighborhood, String normalizedAddress) {
        this.district = district;
        this.neighborhood = neighborhood;
        this.normalizedAddress = normalizedAddress;
    }

    public String getDistrict() { return district; }
    public String getNeighborhood() { return neighborhood; }
    public String getNormalizedAddress() { return normalizedAddress; }

    public static LocationContext unknown() {
        return new LocationContext("Desconocido", "Desconocido", "Dirección no disponible");
    }
}