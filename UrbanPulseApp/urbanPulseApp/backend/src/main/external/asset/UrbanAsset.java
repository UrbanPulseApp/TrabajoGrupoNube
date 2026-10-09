package external.asset;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.Map;

@Getter
@AllArgsConstructor
public class UrbanAsset {
    private final String id;
    private final String type;
    private final String source;
    private final String geometry;
    private final Map<String, Object> metadata;
    private final double distanceMeters;
    private final double confidence;
}