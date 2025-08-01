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

interface Drone {
  id: string;
  name: string;
  drone_id: string;
  area_id: string;
  area: string; // This seems to be a redundant field if area_id is used for linking
}

type Area = {
  name: string;
  area_id: string;
};

export default function DroneManagement() {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [newDrone, setNewDrone] = useState({
    name: "",
    drone_id: "",
    area: "", // This will hold the selected area_id for new drone
  });
  const [editingDrone, setEditingDrone] = useState<Drone | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);

  useEffect(() => {
    fetchDrones();
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

  const fetchDrones = async () => {
    try {
      const res = await axios.get(`${baseUrl}/drones/`);
      setDrones(res.data.data);
    } catch (err) {
      console.error("Failed to fetch drones", err);
      setDrones([]); // Ensure drones is empty on error
    }
  };

  const handleCreate = async () => {
    if (!newDrone.name || !newDrone.drone_id || !newDrone.area) {
      alert("Please fill in all fields");
      return;
    }
    try {
      const res = await axios.post(`${baseUrl}/drones/create`, {
        name: newDrone.name,
        drone_id: newDrone.drone_id,
        area_id: newDrone.area,
      });
      alert(res.data.message);
      setNewDrone({ name: "", drone_id: "", area: "" });
      fetchDrones();
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
    if (!editingDrone) return;
    try {
      await axios.post(`${baseUrl}/drones/update/${editingDrone.id}`, {
        name: editingDrone.name,
        drone_id: editingDrone.drone_id,
        area_id: editingDrone.area_id,
      });
      setEditingDrone(null);
      fetchDrones();
    } catch (err) {
      console.error("Failed to update drone", err);
      alert("Failed to update drone. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this drone?")) {
      return;
    }
    try {
      await axios.post(`${baseUrl}/drones/delete/${id}`);
      fetchDrones();
    } catch (err) {
      console.error("Failed to delete drone", err);
      alert("Failed to delete drone. Please try again.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 text-text-white-custom">
      <h1 className="text-3xl md:text-4xl font-extrabold text-center text-text-white-custom drop-shadow-md">
        Drone Management
      </h1>

      {/* Add Drone Form */}
      <Card className="bg-text-white-custom text-detailing-outline-black shadow-lg rounded-lg p-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-detailing-outline-black">
            Add New Drone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <Label
                htmlFor="newDroneName"
                className="text-detailing-outline-black"
              >
                Drone Name
              </Label>
              <Input
                id="newDroneName"
                placeholder="Enter Drone Name"
                value={newDrone.name}
                onChange={(e) =>
                  setNewDrone({ ...newDrone, name: e.target.value })
                }
                className="h-10 w-full border-detailing-outline-black focus:border-shield-background-navy-blue focus:ring-shield-background-navy-blue"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="newDroneId"
                className="text-detailing-outline-black"
              >
                Drone ID
              </Label>
              <Input
                id="newDroneId"
                placeholder="Enter Drone ID"
                value={newDrone.drone_id}
                onChange={(e) =>
                  setNewDrone({ ...newDrone, drone_id: e.target.value })
                }
                className="h-10 w-full border-detailing-outline-black focus:border-shield-background-navy-blue focus:ring-shield-background-navy-blue"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="newDroneArea"
                className="text-detailing-outline-black"
              >
                Drone Area
              </Label>
              <Select
                value={newDrone.area}
                onValueChange={(value) =>
                  setNewDrone({ ...newDrone, area: value })
                }
              >
                <SelectTrigger
                  id="newDroneArea"
                  className="h-10 w-full border-detailing-outline-black text-detailing-outline-black focus:border-shield-background-navy-blue focus:ring-shield-background-navy-blue"
                >
                  <SelectValue placeholder="Select Drone Area" />
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
            <Button
              className="h-10 w-full bg-shield-background-navy-blue hover:bg-uniform-dark-navy-blue text-text-white-custom font-semibold transition-colors"
              onClick={handleCreate}
            >
              Add Drone
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* All Drones Table */}
      <Card className="bg-text-white-custom text-detailing-outline-black shadow-lg rounded-lg p-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-detailing-outline-black">
            All Drones
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
                    Drone ID
                  </th>
                  <th className="p-3 border-r border-detailing-outline-black font-semibold">
                    Area
                  </th>
                  <th className="p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {drones.length === 0 ? (
                  <tr key="no-drones-row">
                    <td
                      colSpan={4}
                      className="p-4 text-center text-detailing-outline-black"
                    >
                      No drones found.
                    </td>
                  </tr>
                ) : (
                  drones.map((drone) => (
                    <tr
                      key={drone.id}
                      className="border-t border-detailing-outline-black hover:bg-shield-background-navy-blue hover:text-text-white-custom transition-colors"
                    >
                      <td className="p-3 border-r border-detailing-outline-black">
                        {editingDrone?.id === drone.id ? (
                          <Input
                            value={editingDrone?.name}
                            onChange={(e) =>
                              setEditingDrone({
                                ...editingDrone,
                                name: e.target.value,
                              })
                            }
                            className="h-9 border-detailing-outline-black focus:border-emblem-wreath-golden-yellow focus:ring-emblem-wreath-golden-yellow"
                          />
                        ) : (
                          drone.name
                        )}
                      </td>
                      <td className="p-3 border-r border-detailing-outline-black">
                        {editingDrone?.id === drone.id ? (
                          <Input
                            value={editingDrone.drone_id}
                            disabled
                            className="h-9"
                          />
                        ) : (
                          drone.drone_id
                        )}
                      </td>
                      <td className="p-3 border-r border-detailing-outline-black">
                        {editingDrone?.id === drone.id ? (
                          <Select
                            value={editingDrone.area_id}
                            onValueChange={(value) =>
                              setEditingDrone({
                                ...editingDrone,
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
                          drone.area_id
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          {editingDrone?.id === drone.id ? (
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
                                onClick={() => setEditingDrone(null)}
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
                                onClick={() => setEditingDrone(drone)}
                                className="p-2 bg-emblem-wreath-golden-yellow hover:bg-emblem-wreath-golden-yellow/90 text-detailing-outline-black border-detailing-outline-black"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(drone.id)}
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
