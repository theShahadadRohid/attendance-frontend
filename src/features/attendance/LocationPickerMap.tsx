import { useMemo, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Circle } from "react-leaflet";

import "leaflet/dist/leaflet.css";

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationPickerMapProps {
  position: Coordinates;
  officeLocation: Coordinates;
  radiusMeters: number;
  onPositionChange: (position: Coordinates) => void;
}

interface DraggableMarkerProps {
  position: Coordinates;
  onPositionChange: (position: Coordinates) => void;
}

function DraggableMarker({ position, onPositionChange }: DraggableMarkerProps) {
  const markerRef = useRef<L.Marker>(null);

  const icon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: `
          <div style="
            width: 20px;
            height: 20px;
            background: #ef4444;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 1px 6px #555;
          "></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      }),
    [],
  );

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;

        if (!marker) return;

        const { lat, lng } = marker.getLatLng();

        onPositionChange({
          latitude: lat,
          longitude: lng,
        });
      },
    }),
    [onPositionChange],
  );

  return (
    <Marker
      ref={markerRef}
      position={[position.latitude, position.longitude]}
      draggable
      icon={icon}
      eventHandlers={eventHandlers}
    />
  );
}

export default function LocationPickerMap({
  position,
  officeLocation,
  radiusMeters,
  onPositionChange,
}: LocationPickerMapProps) {
  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border">
        <MapContainer
          center={[position.latitude, position.longitude]}
          zoom={18}
          scrollWheelZoom
          style={{ height: "350px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Office 50-meter boundary */}
          <Circle
            center={[officeLocation.latitude, officeLocation.longitude]}
            radius={radiusMeters}
            pathOptions={{
              color: "#2563eb",
              fillColor: "#3b82f6",
              fillOpacity: 0.12,
            }}
          />

          {/* Employee's draggable red marker */}
          <DraggableMarker
            position={position}
            onPositionChange={onPositionChange}
          />
        </MapContainer>
      </div>
    </div>
  );
}
