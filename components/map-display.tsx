"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { baseUrl } from "@/lib/config.js";
import { Button } from "./ui/button";
import { SensorSettings } from "./sensor-settings";

interface Sensor {
  __v: number;
  _id: string;
  area_id: string;
  latitude: number;
  longitude: number;
  name: string;
  sensor_id: string;
}

interface MapDisplayProps {
  setCurrentSensor: (sensor: Sensor | null) => void;
}

export default function MapDisplay({ setCurrentSensor }: MapDisplayProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const droneRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const pathRef = useRef<L.LatLng[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [clickMode, setClickMode] = useState(false);
  const clickModeRef = useRef(false);
  const [clickAddSensor, setClickAddSensor] = useState(false);
  const clickAddSensorRef = useRef(false);
  const [addSensorLat, setAddSensorLat] = useState(0);
  const [addSensorLng, setAddSensorLng] = useState(0);
  const [sensorAddSuccess, setSensorAddSuccess] = useState(false);
  const [refreshSensorList, setRefreshSensorList] = useState(false);

  // const DEFAULT_LAT = 32.7976667;
  // const DEFAULT_LNG = 74.9077222;

  // const bounds: L.LatLngBoundsLiteral = [
  //   [32.808829, 74.890582],
  //   [32.770696, 74.928948],
  // ];

  const DEFAULT_LAT = 17.451264;
  const DEFAULT_LNG = 78.370959;

  const DEFAULT_DRONE_LAT = 17.451264;
  const DEFAULT_DRONE_LNG = 78.370959;

  const bounds: L.LatLngBoundsLiteral = [
    [17.502134, 78.420223],
    [17.420713, 78.312621],
  ];

  const sensorIcon = L.icon({
    iconUrl: "/icons/sensor_icon3.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  const droneIcon = L.icon({
    iconUrl: "/drone.png",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const res = await fetch(`${baseUrl}/sensors/`);
        const response = await res.json();

        if (response.status && response.data) {
          const data: Sensor[] = response.data;
          setSensors(data);

          if (mapRef.current && !leafletMapRef.current) {
            const map = L.map(mapRef.current, {
              center: [DEFAULT_LAT, DEFAULT_LNG],
              zoom: 15,
              minZoom: 15,
              maxZoom: 20,
              maxBounds: bounds,
              maxBoundsViscosity: 1.0,
            });

            L.tileLayer("/hyd/{z}/{x}/{y}.jpg", {
              tileSize: 256,
              noWrap: true,
              bounds: bounds,
              attribution: "Offline Tiles",
              errorTileUrl: "/placeholder.jpg",
            }).addTo(map);

            leafletMapRef.current = map;

            //set drone default coordinates
            const droneMarker = L.marker(
              [DEFAULT_DRONE_LAT, DEFAULT_DRONE_LNG],
              {
                icon: droneIcon,
              }
            ).addTo(map);

            droneRef.current = droneMarker;

            const polyline = L.polyline([], {
              color: "red",
              weight: 5,
              opacity: 0.8,
              smoothFactor: 1,
            }).addTo(map);

            polylineRef.current = polyline;

            map.on("click", (e: any) => {
              if (clickModeRef.current) {
                if (clickAddSensorRef.current) {
                  setAddSensorLat(e.latlng.lat);
                  setAddSensorLng(e.latlng.lng);
                } else {
                  setCurrentSensor({
                    __v: 0,
                    _id: "",
                    area_id: "",
                    latitude: e.latlng.lat,
                    longitude: e.latlng.lng,
                    name: "New Sensor",
                    sensor_id: "",
                  });
                }

                L.marker([e.latlng.lat, e.latlng.lng], {
                  icon: sensorIcon,
                }).addTo(map);
              }
            });
          }

          leafletMapRef.current?.eachLayer((layer: any) => {
            if (layer instanceof L.Marker && layer !== droneRef.current) {
              leafletMapRef.current?.removeLayer(layer);
            }
          });

          data.forEach((sensor) => {
            if (!isNaN(sensor.latitude) && !isNaN(sensor.longitude)) {
              const marker = L.marker([sensor.latitude, sensor.longitude], {
                icon: sensorIcon,
              })
                .addTo(leafletMapRef.current!)
                .bindPopup(sensor.name);

              marker.on("click", () => setCurrentSensor({ ...sensor }));
            }
          });

          requestAnimationFrame(() => {
            leafletMapRef.current?.invalidateSize();
          });
        }
      } catch (error) {
        console.error("Failed to fetch sensors:", error);
      }
    };

    fetchSensors();
  }, [refreshSensorList]);

  useEffect(() => {
    if (!leafletMapRef.current) return;
    const mapEl = leafletMapRef.current.getContainer();
    mapEl.style.cursor = clickMode ? "crosshair" : "";
  }, [clickMode]);

  useEffect(() => {
    clickAddSensorRef.current = clickAddSensor;
  }, [clickAddSensor]);

  useEffect(() => {
    if (sensorAddSuccess) {
      setClickAddSensor(false);
      setSensorAddSuccess(false);
      setClickMode(false);
      clickModeRef.current = false;
      clickAddSensorRef.current = false;
      setAddSensorLat(0);
      setAddSensorLng(0);
      setRefreshSensorList((prev) => !prev);
    }
  }, [sensorAddSuccess]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:5000");

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "location" && message.data) {
        const { lat, long } = message.data;
        const newPoint = L.latLng(lat, long);
        animateDroneTo(newPoint);
      }
    };

    return () => socket.close();
  }, []);

  const animateDroneTo = (to: L.LatLng) => {
    const marker = droneRef.current;
    if (!marker) return;

    const from = marker.getLatLng();
    const steps = 60;
    const duration = 1000;
    const stepTime = duration / steps;
    let step = 0;

    const move = () => {
      if (step >= steps) {
        marker.setLatLng(to);
        pathRef.current.push(to);
        polylineRef.current?.setLatLngs(pathRef.current);
        return;
      }

      const lat = from.lat + ((to.lat - from.lat) * step) / steps;
      const lng = from.lng + ((to.lng - from.lng) * step) / steps;
      const next = new L.LatLng(lat, lng);

      marker.setLatLng(next);
      step++;
      setTimeout(move, stepTime);
    };

    move();
  };

  return (
    <div className="w-full h-full relative rounded-lg border shadow">
      <div className="absolute z-[1000] top-4 right-4 flex flex-row gap-4">
        <button
          className="bg-white px-4 py-2 rounded-lg shadow hover:bg-gray-100 border border-gray-300"
          onClick={() => {
            setClickMode(true);
            clickModeRef.current = true;
            setClickAddSensor(true);
          }}
        >
          Add Sensor
        </button>
        <button
          className="bg-white p-2 rounded-full shadow hover:bg-gray-100 border border-gray-300"
          onClick={() => {
            setClickMode((prev) => {
              const newState = !prev;
              clickModeRef.current = newState;
              return newState;
            });
          }}
        >
          <img
            src="/icons/pin.png"
            alt="Pick Location"
            className={`w-6 h-6 ${clickMode ? "opacity-100" : "opacity-50"}`}
          />
        </button>
      </div>

      {clickAddSensor && (
        <div className="absolute z-[1000] top-4 left-4">
          <SensorSettings
            addSensorLat={addSensorLat}
            addSensorLng={addSensorLng}
            disableLatLng={true}
            setSensorAddSuccess={setSensorAddSuccess}
          />
          <div className="absolute top-4 right-4 flex flex-row gap-4 z-[1001]">
            <Button
              onClick={() => {
                setClickAddSensor(false);
                setClickMode(false);
              }}
              className="bg-white px-4 py-2 rounded-lg shadow hover:bg-gray-100 border border-gray-300 text-black"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      <div
        ref={mapRef}
        id="leaflet-map"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
