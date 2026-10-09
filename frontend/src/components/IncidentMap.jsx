import { useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

function LocationMarker({ onLocationSelected }) {

    const [position, setPosition] = useState(null);

    useMapEvents({
        click(event) {

            const newPosition = {
                latitude: event.latlng.lat,
                longitude: event.latlng.lng
            };

            setPosition(event.latlng);

            onLocationSelected(newPosition);
        }
    });

    return position === null
        ? null
        : <Marker position={position} />;
}

export default function IncidentMap({
                                        latitude,
                                        longitude,
                                        onLocationSelected
                                    }) {

    const defaultPosition = [
        latitude ?? 36.7213,
        longitude ?? -4.4214
    ];

    return (
        <MapContainer
            center={defaultPosition}
            zoom={13}
            style={{
                height: "400px",
                width: "100%"
            }}
        >

            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <LocationMarker
                onLocationSelected={onLocationSelected}
            />

        </MapContainer>
    );
}