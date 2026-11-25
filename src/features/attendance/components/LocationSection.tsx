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
  onPositionChange,
}: LocationSectionProps) {
  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4F8E8] text-[#789522]">
            <FiMapPin className="text-xl" />
          </div>

          <div>
            <h2 className="text-base font-bold text-[#171719] sm:text-lg">
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
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D3F269] px-4 py-2.5 text-sm font-semibold text-[#171719] transition hover:bg-[#C4E65C] focus:outline-none focus:ring-2 focus:ring-[#D3F269]/50 focus:ring-offset-2"
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
            onPositionChange={onPositionChange}
          />
        </div>
      ) : (
        <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
            <FiMapPin className="text-lg" />
          </div>

          <p className="text-sm font-medium text-slate-700">
            Location not detected yet
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Click "Get My Location" to detect and confirm your position.
          </p>
        </div>
      )}
    </section>
  );
}
