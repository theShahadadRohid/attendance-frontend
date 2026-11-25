import { FiMapPin } from "react-icons/fi";

import LocationPickerMap from "../LocationPickerMap";
import type { Coordinates } from "../utils/geolocation";

interface LocationSectionProps {
  currentLocation: Coordinates | null;
  officeLocation: Coordinates;
  officeRadiusMeters: number;
  onGetMyLocation: () => void;
  onPositionChange: (position: Coordinates) => void;
}

export function LocationSection({
  currentLocation,
  officeLocation,
  officeRadiusMeters,
  onGetMyLocation,
  onPositionChange,
}: LocationSectionProps) {
  return (
    <section className="space-y-4 rounded-xl border bg-white p-4">
      <h2 className="text-lg font-semibold">Your Location</h2>

      <button
        type="button"
        onClick={onGetMyLocation}
        className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
      >
        <FiMapPin className="mr-2 inline" />
        Get My Location
      </button>

      {currentLocation && (
        <LocationPickerMap
          position={currentLocation}
          officeLocation={officeLocation}
          radiusMeters={officeRadiusMeters}
          onPositionChange={onPositionChange}
        />
      )}
    </section>
  );
}
