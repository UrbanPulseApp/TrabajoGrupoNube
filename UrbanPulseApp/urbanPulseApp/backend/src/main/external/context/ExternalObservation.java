package external.context;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ExternalObservation {
    private final String source;
    private final LocalDateTime observationTime;
    private final LocalDateTime ingestionTime;
    private final String unit;
    private final String value;
    private final String quality;
}