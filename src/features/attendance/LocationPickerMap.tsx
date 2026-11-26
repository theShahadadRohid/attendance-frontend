import { useMemo } from "react";
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
}

export default function LocationPickerMap({
  position,
  officeLocation,
  radiusMeters,
}: LocationPickerMapProps) {
  const employeeIcon = useMemo(
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

          <Circle
            center={[officeLocation.latitude, officeLocation.longitude]}
            radius={radiusMeters}
            pathOptions={{
              color: "#2563eb",
              fillColor: "#3b82f6",
              fillOpacity: 0.12,
            }}
          />

          {/* Employee's fixed GPS location marker */}
          <Marker
            position={[position.latitude, position.longitude]}
            icon={employeeIcon}
            interactive={false}
          />
        </MapContainer>
      </div>
    </div>
  );
}
