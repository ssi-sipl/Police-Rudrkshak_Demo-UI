"use client";

import dynamic from "next/dynamic";
// Import MapDisplay only on client-side
const MapDisplay = dynamic(() => import("@/components/map-display"), {
  ssr: false,
});

import { ConfigurationPanel } from "@/components/configuration-panel";
import LiveAlertDisplay from "@/components/live-alert-display"; // Import the new component
import { useState } from "react";

interface Sensor {
  __v: number;
  _id: string;
  area_id: string;
  latitude: number;
  longitude: number;
  name: string;
  sensor_id: string;
}

export default function Dashboard() {
  const [currentSensor, setCurrentSensor] = useState<Sensor | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Live Alerts Display */}
      <div className="mb-6">
        {" "}
        {/* Added margin-bottom for spacing */}
        <LiveAlertDisplay />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Map container with responsive height */}
        <div className="lg:col-span-2 bg-gray-50 rounded-lg shadow-sm">
          <div className="h-full ">
            <MapDisplay setCurrentSensor={setCurrentSensor} />
          </div>
        </div>
        {/* Configuration panel with responsive height */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <ConfigurationPanel currentSensor={currentSensor} />
        </div>
      </div>
    </div>
  );
}
