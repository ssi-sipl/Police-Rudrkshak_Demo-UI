"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { baseUrl } from "@/lib/config";
import { DroneDropdown } from "./drone-dropdown";
import { latLngToMGRS, mgrsToLatLng } from "@/lib/mgrs"; // ✅ import
import { RotateCcw } from "lucide-react"; // Add this import

interface Sensor {
  __v: number;
  _id: string;
  area_id: string;
  latitude: number;
  longitude: number;
  name: string;
  sensor_id: string;
}

interface ConfigurationPanelProps {
  currentSensor: Sensor | null;
}

export function ConfigurationPanel({ currentSensor }: ConfigurationPanelProps) {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [altitude, setAltitude] = useState("10");
  const [areaId, setAreaId] = useState("");
  const [selectedDroneId, setSelectedDroneId] = useState<string | undefined>();
  const [usbAddress, setUsbAddress] = useState("");
  const [gridRef, setGridRef] = useState(""); // ✅ MGRS state

  // Load sensor lat/lng if available
  useEffect(() => {
    if (!currentSensor) return;
    const lat = currentSensor.latitude.toFixed(8);
    const lng = currentSensor.longitude.toFixed(8);
    setLatitude(lat);
    setLongitude(lng);
  }, [currentSensor]);

  // Update MGRS when lat/lng changes
  useEffect(() => {
    if (latitude && longitude) {
      const mgrsStr = latLngToMGRS(
        Number.parseFloat(latitude),
        Number.parseFloat(longitude)
      );
      setGridRef(mgrsStr);
    }
  }, [latitude, longitude]);

  // Handle manual MGRS input
  const handleGridRefChange = (value: string) => {
    setGridRef(value.toUpperCase().trim());
    const point = mgrsToLatLng(value);
    if (point) {
      setLatitude(point.lat.toFixed(8));
      setLongitude(point.lng.toFixed(8));
    }
  };

  useEffect(() => {
    const fetchAreaByDroneId = async () => {
      try {
        const res = await fetch(`${baseUrl}/drones/${selectedDroneId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch area");
        console.log("Fetched area data:", data);
        setAreaId(data.data.area_id);
      } catch (err) {
        console.error("Error fetching area by drone ID:", err);
        setAreaId("No Area");
      }
    };
    if (selectedDroneId) fetchAreaByDroneId();
  }, [selectedDroneId]);

  const handleSendDrone = async () => {
    try {
      if (
        latitude &&
        longitude &&
        altitude &&
        selectedDroneId &&
        areaId &&
        usbAddress
      ) {
        console.log("Sending drone with data:", {
          drone_id: selectedDroneId,
          area_id: areaId,
          latitude: Number(latitude),
          longitude: Number(longitude),
          altitude: Number(altitude),
          usb_address: usbAddress,
        });
        const res = await fetch(`${baseUrl}/drones/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            drone_id: selectedDroneId,
            area_id: areaId,
            latitude: Number(latitude),
            longitude: Number(longitude),
            altitude: Number(altitude),
            usb_address: usbAddress,
          }),
        });
        const result = await res.json();
        alert(result.message);
        console.log(result);
        setLatitude("");
        setLongitude("");
        setAltitude("10");
        setUsbAddress("");
        setGridRef("");
      } else {
        alert("Please fill in all fields");
      }
    } catch (error) {
      console.error("Error sending drone:", error);
      alert("Failed to send drone. Please try again.");
    }
  };

  const handleDropPayload = async () => {
    try {
      if (selectedDroneId && areaId) {
        const res = await fetch(`${baseUrl}/drones/dropPayload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            drone_id: selectedDroneId,
            area_id: areaId,
          }),
        });
        const result = await res.json();
        alert(result.message);
        console.log(result);
      }
    } catch (error) {
      console.error("Error dropping payload:", error);
      alert("Failed to drop payload. Please try again.");
    }
  };

  const handleDroneCallback = async () => {
    try {
      if (selectedDroneId && areaId) {
        const res = await fetch(`${baseUrl}/drones/droneCallback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            drone_id: selectedDroneId,
            area_id: areaId,
          }),
        });
        const result = await res.json();
        alert(result.message);
        console.log(result);
      }
    } catch (error) {
      console.error("Error dropping payload:", error);
      alert("Failed to drop payload. Please try again.");
    }
  };

  const handleDroneView = async () => {
    if (typeof window !== "undefined") {
      const mediaMtxHost = baseUrl.replace(":5000", ":8889");
      const streamUrl = `${mediaMtxHost}/${selectedDroneId}`;
      window.open(streamUrl, "_blank", "width=800,height=600");
    }
  };

  const handleResetValues = () => {
    setLatitude("");
    setLongitude("");
    setAltitude("10");
    setAreaId("");
    setSelectedDroneId(undefined);
    setUsbAddress("");
    setGridRef("");
  };

  return (
    <Card className="bg-text-white-custom text-detailing-outline-black">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>
          {" "}
          Deploy Drone <span className="text-sm">(డ్రోన్ పంపించండి)</span>
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleResetValues}
          aria-label="Reset values"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="latitude">Latitude (అక్షాంశం)</Label>
            <Input
              id="latitude"
              type="number"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="Enter latitude"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="longitude">Longitude (రేఖాంశం)</Label>
            <Input
              id="longitude"
              type="number"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="Enter longitude"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="gridRef">Grid Reference (MGRS)</Label>
            <Input
              id="gridRef"
              type="text"
              value={gridRef}
              onChange={(e) => handleGridRefChange(e.target.value)}
              placeholder="e.g. 43QED1234567890"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="altitude">Altitude (ఎత్తు)</Label>
            <Input
              id="altitude"
              type="number"
              value={altitude}
              onChange={(e) => setAltitude(e.target.value)}
              placeholder="Enter altitude"
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="droneID">Select Drone (డ్రోన్ ఎంచుకోండి)</Label>
            <DroneDropdown
              selectedDroneId={selectedDroneId ?? null}
              setSelectedDroneId={(id) => setSelectedDroneId(id)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="usb_address">USB Address</Label>
            <Input
              id="usb_address"
              type="text"
              value={usbAddress}
              onChange={(e) => setUsbAddress(e.target.value)}
              placeholder="Enter USB address"
            />
          </div>
          {/* <div className="grid gap-1">
          <Label className="text-detailing-outline-black" htmlFor="areaID">
            Area ID (Auto)
          </Label>
          <AreaDropdown
            selectedAreaId={areaId}
            setSelectedAreaId={() => {}}
            disabled={true}
          />
        </div> */}
          <Button
            className="w-full bg-shield-background-navy-blue hover:bg-uniform-dark-navy-blue text-text-white-custom"
            onClick={handleSendDrone}
            disabled={!selectedDroneId}
          >
            Send Drone / డ్రోన్ పంపండి
          </Button>
          <Button
            className="w-full bg-green-500 hover:bg-green-500/90 text-detailing-outline-black transition-all ease-in-out"
            onClick={handleDropPayload}
            disabled={!selectedDroneId}
          >
            Patrol / పర్యవేక్షణ
          </Button>
          <Button
            className="w-full bg-emblem-wreath-golden-yellow hover:bg-emblem-wreath-golden-yellow/90 text-detailing-outline-black transition-all ease-in-out"
            onClick={handleDroneCallback}
            disabled={!selectedDroneId}
          >
            Drone Callback (డ్రోన్‌ను తిరిగి పిలించండి)
          </Button>
          {/* <Button
          className="w-full bg-cyan-500 hover:bg-cyan-600 transition-all ease-in-out"
          onClick={handleDroneView}
          disabled={!selectedDroneId}
        >
          Drone View
        </Button> */}
        </div>
      </CardContent>
    </Card>
  );
}
