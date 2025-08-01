"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "@/lib/config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, Save, X } from "lucide-react"; // Import Save and X icons
import { Label } from "@/components/ui/label"; // Ensure Label is imported

interface Sensor {
  id: string;
  name: string;
  sensor_id: string;
  area_id: string;
  latitude: number;
  longitude: number;
}

type Area = {
  name: string;
  area_id: string;
};

export default function SensorManagement() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [newSensor, setNewSensor] = useState({
    name: "",
    sensor_id: "",
    area_id: "",
    latitude: "" as string | number, // Initialize as string to handle empty input
    longitude: "" as string | number, // Initialize as string to handle empty input
  });
  const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);

  useEffect(() => {
    fetchSensors();
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const res = await fetch(`${baseUrl}/areas`);
      const response = await res.json();
      if (response.status && response.data) {
        setAreas(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch areas:", error);
      setAreas([]); // Ensure areas is empty on error
    }
  };

  const fetchSensors = async () => {
    try {
      const res = await axios.get(`${baseUrl}/sensors`);
      setSensors(res.data.data);
    } catch (err) {
      console.error("Failed to fetch sensors", err);
      setSensors([]); // Ensure sensors is empty on error
    }
  };

  const handleCreate = async () => {
    if (
      !newSensor.name ||
      !newSensor.sensor_id ||
      !newSensor.area_id ||
      newSensor.latitude === "" ||
      newSensor.longitude === ""
    ) {
      alert("Please fill in all fields");
      return;
    }
    try {
      const res = await axios.post(`${baseUrl}/sensors/create`, {
        ...newSensor,
        latitude: Number(newSensor.latitude), // Convert to number before sending
        longitude: Number(newSensor.longitude), // Convert to number before sending
      });
      alert(res.data.message);
      setNewSensor({
        name: "",
        sensor_id: "",
        area_id: "",
        latitude: "",
        longitude: "",
      });
      fetchSensors();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.message) {
          alert(err.response.data.message);
        } else {
          alert("An unexpected error occurred.");
        }
      } else {
        alert("Something went wrong.");
      }
    }
  };

  const handleUpdate = async () => {
    if (!editingSensor) return;
    try {
      await axios.post(
        `${baseUrl}/sensors/update/${editingSensor.id}`,
        editingSensor
      );
      setEditingSensor(null);
      fetchSensors();
    } catch (err) {
      console.error("Failed to update sensor", err);
      alert("Failed to update sensor. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sensor?")) {
      return;
    }
    try {
      await axios.post(`${baseUrl}/sensors/delete/${id}`);
      fetchSensors();
    } catch (err) {
      console.error("Failed to delete sensor", err);
      alert("Failed to delete sensor. Please try again.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 text-text-white-custom">
      <h1 className="text-3xl md:text-4xl font-extrabold text-center text-text-white-custom drop-shadow-md">
        Sensor Management
      </h1>

      {/* Add Sensor Form */}
      <Card className="bg-text-white-custom text-detailing-outline-black shadow-lg rounded-lg p-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-detailing-outline-black">
            Add New Sensor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 items-end">
            <div className="space-y-2">
              <Label
                htmlFor="newSensorName"
                className="text-detailing-outline-black"
              >
                Sensor Name
              </Label>
              <Input
                id="newSensorName"
                placeholder="Sensor Name"
                value={newSensor.name}
                onChange={(e) =>
                  setNewSensor({ ...newSensor, name: e.target.value })
                }
                className="h-10 w-full border-detailing-outline-black focus:border-shield-background-navy-blue focus:ring-shield-background-navy-blue"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="newSensorId"
                className="text-detailing-outline-black"
              >
                Sensor ID
              </Label>
              <Input
                id="newSensorId"
                placeholder="Sensor ID"
                value={newSensor.sensor_id}
                onChange={(e) =>
                  setNewSensor({ ...newSensor, sensor_id: e.target.value })
                }
                className="h-10 w-full border-detailing-outline-black focus:border-shield-background-navy-blue focus:ring-shield-background-navy-blue"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="newSensorArea"
                className="text-detailing-outline-black"
              >
                Area
              </Label>
              <Select
                value={newSensor.area_id}
                onValueChange={(value) =>
                  setNewSensor({ ...newSensor, area_id: value })
                }
              >
                <SelectTrigger
                  id="newSensorArea"
                  className="h-10 w-full border-detailing-outline-black text-detailing-outline-black focus:border-shield-background-navy-blue focus:ring-shield-background-navy-blue"
                >
                  <SelectValue placeholder="Select Area" />
                </SelectTrigger>
                <SelectContent>
                  {areas.length > 0 ? (
                    areas.map((area) => (
                      <SelectItem key={area.area_id} value={area.area_id}>
                        {area.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No areas available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="newSensorLatitude"
                className="text-detailing-outline-black"
              >
                Latitude
              </Label>
              <Input
                id="newSensorLatitude"
                type="number"
                placeholder="Latitude"
                value={newSensor.latitude}
                onChange={(e) =>
                  setNewSensor({ ...newSensor, latitude: e.target.value })
                }
                className="h-10 w-full border-detailing-outline-black focus:border-shield-background-navy-blue focus:ring-shield-background-navy-blue"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="newSensorLongitude"
                className="text-detailing-outline-black"
              >
                Longitude
              </Label>
              <Input
                id="newSensorLongitude"
                type="number"
                placeholder="Longitude"
                value={newSensor.longitude}
                onChange={(e) =>
                  setNewSensor({ ...newSensor, longitude: e.target.value })
                }
                className="h-10 w-full border-detailing-outline-black focus:border-shield-background-navy-blue focus:ring-shield-background-navy-blue"
              />
            </div>
            <Button
              className="h-10 w-full bg-shield-background-navy-blue hover:bg-uniform-dark-navy-blue text-text-white-custom font-semibold transition-colors"
              onClick={handleCreate}
            >
              Add Sensor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* All Sensors Table */}
      <Card className="bg-text-white-custom text-detailing-outline-black shadow-lg rounded-lg p-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-detailing-outline-black">
            All Sensors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-detailing-outline-black shadow-sm">
            <table className="min-w-full text-left border-collapse">
              <thead className="bg-uniform-dark-navy-blue text-text-white-custom">
                <tr>
                  <th className="p-3 border-r border-detailing-outline-black font-semibold">
                    Name
                  </th>
                  <th className="p-3 border-r border-detailing-outline-black font-semibold">
                    Sensor ID
                  </th>
                  <th className="p-3 border-r border-detailing-outline-black font-semibold">
                    Area ID
                  </th>
                  <th className="p-3 border-r border-detailing-outline-black font-semibold">
                    Latitude
                  </th>
                  <th className="p-3 border-r border-detailing-outline-black font-semibold">
                    Longitude
                  </th>
                  <th className="p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sensors.length === 0 ? (
                  <tr key="no-sensors-row">
                    <td
                      colSpan={6}
                      className="p-4 text-center text-detailing-outline-black"
                    >
                      No sensors found.
                    </td>
                  </tr>
                ) : (
                  sensors.map((sensor) => (
                    <tr
                      key={sensor.id}
                      className="border-t border-detailing-outline-black hover:bg-shield-background-navy-blue hover:text-text-white-custom transition-colors"
                    >
                      <td className="p-3 border-r border-detailing-outline-black">
                        {editingSensor?.id === sensor.id ? (
                          <Input
                            value={editingSensor.name}
                            onChange={(e) =>
                              setEditingSensor({
                                ...editingSensor,
                                name: e.target.value,
                              })
                            }
                            className="h-9 border-detailing-outline-black focus:border-emblem-wreath-golden-yellow focus:ring-emblem-wreath-golden-yellow"
                          />
                        ) : (
                          sensor.name
                        )}
                      </td>
                      <td className="p-3 border-r border-detailing-outline-black">
                        {editingSensor?.id === sensor.id ? (
                          <Input
                            value={editingSensor.sensor_id}
                            disabled
                            className="h-9"
                          />
                        ) : (
                          sensor.sensor_id
                        )}
                      </td>
                      <td className="p-3 border-r border-detailing-outline-black">
                        {editingSensor?.id === sensor.id ? (
                          <Select
                            value={editingSensor.area_id}
                            onValueChange={(value) =>
                              setEditingSensor({
                                ...editingSensor,
                                area_id: value,
                              })
                            }
                          >
                            <SelectTrigger className="h-9 w-full border-detailing-outline-black text-detailing-outline-black focus:border-emblem-wreath-golden-yellow focus:ring-emblem-wreath-golden-yellow">
                              <SelectValue placeholder="Select Area" />
                            </SelectTrigger>
                            <SelectContent>
                              {areas.length > 0 ? (
                                areas.map((area) => (
                                  <SelectItem
                                    key={area.area_id}
                                    value={area.area_id}
                                  >
                                    {area.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="none" disabled>
                                  No areas available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        ) : (
                          sensor.area_id
                        )}
                      </td>
                      <td className="p-3 border-r border-detailing-outline-black">
                        {editingSensor?.id === sensor.id ? (
                          <Input
                            type="number"
                            value={editingSensor.latitude}
                            onChange={(e) =>
                              setEditingSensor({
                                ...editingSensor,
                                latitude: Number.parseFloat(e.target.value),
                              })
                            }
                            className="h-9 border-detailing-outline-black focus:border-emblem-wreath-golden-yellow focus:ring-emblem-wreath-golden-yellow"
                          />
                        ) : (
                          sensor.latitude
                        )}
                      </td>
                      <td className="p-3 border-r border-detailing-outline-black">
                        {editingSensor?.id === sensor.id ? (
                          <Input
                            type="number"
                            value={editingSensor.longitude}
                            onChange={(e) =>
                              setEditingSensor({
                                ...editingSensor,
                                longitude: Number.parseFloat(e.target.value),
                              })
                            }
                            className="h-9 border-detailing-outline-black focus:border-emblem-wreath-golden-yellow focus:ring-emblem-wreath-golden-yellow"
                          />
                        ) : (
                          sensor.longitude
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          {editingSensor?.id === sensor.id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={handleUpdate}
                                className="bg-emblem-wreath-golden-yellow hover:bg-emblem-wreath-golden-yellow/90 text-detailing-outline-black font-semibold"
                              >
                                <Save className="w-4 h-4 mr-1" /> Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingSensor(null)}
                                className="bg-uniform-dark-navy-blue hover:bg-shield-background-navy-blue text-text-white-custom border-detailing-outline-black font-semibold"
                              >
                                <X className="w-4 h-4 mr-1" /> Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingSensor(sensor)}
                                className="p-2 bg-emblem-wreath-golden-yellow hover:bg-emblem-wreath-golden-yellow/90 text-detailing-outline-black border-detailing-outline-black"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(sensor.id)}
                                className="p-2 bg-police-band-red hover:bg-police-band-red/90 text-text-white-custom border-detailing-outline-black"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
