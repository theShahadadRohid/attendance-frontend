import { FiMapPin, FiNavigation } from "react-icons/fi";

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
  // onPositionChange,
}: LocationSectionProps) {
  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#F40026]">
            <FiMapPin className="text-xl" />
          </div>

          <div>
            <h2 className="text-base font-bold text-[#030708] sm:text-lg">
              Your Location
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Confirm your location before checking in or out.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onGetMyLocation}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F40026] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-[#F40026]/40 focus:ring-offset-2 sm:w-auto"
        >
          <FiNavigation className="text-base" />
          Get My Location
        </button>
      </div>

      {currentLocation ? (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <LocationPickerMap
            position={currentLocation}
            officeLocation={officeLocation}
            radiusMeters={officeRadiusMeters}
            // onPositionChange={onPositionChange}
          />
        </div>
      ) : (
        <div className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-red-200 bg-red-50/40 px-4 py-7 text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#F40026] shadow-sm">
            <FiMapPin className="text-xl" />
          </div>

          <p className="text-sm font-semibold text-[#030708]">
            Location not detected yet
          </p>

          <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
            Click "Get My Location" to detect and confirm your position before
            proceeding with attendance.
          </p>
        </div>
      )}
    </section>
  );
}
