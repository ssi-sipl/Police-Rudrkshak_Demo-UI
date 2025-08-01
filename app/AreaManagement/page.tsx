"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Save, X } from "lucide-react"; // Import Save and X icons
import { baseUrl } from "@/lib/config";
import { Label } from "@/components/ui/label"; // Ensure Label is imported

export default function AreaManagement() {
  const [areas, setAreas] = useState<any[]>([]); // Use any[] for now, or define a proper Area interface
  const [name, setName] = useState("");
  const [areaId, setAreaId] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    [key: string]: { name: string; area_id: string };
  }>({});

  const fetchAreas = async () => {
    try {
      const res = await axios.get(`${baseUrl}/areas`);
      setAreas(res.data.data);
    } catch (err) {
      console.error("Failed to fetch areas", err);
      setAreas([]); // Ensure areas is an empty array on error
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const handleSubmit = async () => {
    if (!name || !areaId) {
      alert("Please enter both name and area ID");
      return;
    }
    try {
      const res = await axios.post(`${baseUrl}/areas/create`, {
        name,
        area_id: areaId,
      });
      alert(res.data.message);
      setName("");
      setAreaId("");
      fetchAreas();
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

  const handleEditClick = (area: any) => {
    setEditId(area.id);
    setEditValues({
      ...editValues,
      [area.id]: {
        name: area.name,
        area_id: area.area_id,
      },
    });
  };

  const handleEditChange = (
    id: string,
    field: "name" | "area_id",
    value: string
  ) => {
    setEditValues((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleEditSave = async (id: string) => {
    try {
      const { name, area_id } = editValues[id];
      await axios.post(`${baseUrl}/areas/update`, {
        id,
        name,
        area_id,
      });
      setEditId(null);
      fetchAreas();
    } catch (err) {
      console.error("Error updating area", err);
      alert("Failed to update area. Please try again.");
    }
  };

  const handleEditCancel = () => {
    setEditId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this area?")) {
      return;
    }
    try {
      await axios.post(`${baseUrl}/areas/delete/${id}`);
      fetchAreas();
    } catch (err) {
      console.error("Error deleting area", err);
      alert("Failed to delete area. Please try again.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 text-text-white-custom">
      <h1 className="text-3xl md:text-4xl font-extrabold text-center text-text-white-custom drop-shadow-md">
        Area Management
      </h1>

      {/* Add Area Form */}
      <Card className="bg-text-white-custom text-detailing-outline-black shadow-lg rounded-lg p-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-detailing-outline-black">
            Add New Area
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-detailing-outline-black">
                Area Name
              </Label>
              <Input
                id="name"
                className="w-full h-10 border-detailing-outline-black focus:border-shield-background-navy-blue focus:ring-shield-background-navy-blue"
                value={name}
                placeholder="Enter Area Name"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="areaId" className="text-detailing-outline-black">
                Area ID
              </Label>
              <Input
                id="areaId"
                className="w-full h-10 border-detailing-outline-black focus:border-shield-background-navy-blue focus:ring-shield-background-navy-blue"
                value={areaId}
                placeholder="e.g., AREA001"
                onChange={(e) => setAreaId(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                className="w-full h-10 bg-shield-background-navy-blue hover:bg-uniform-dark-navy-blue text-text-white-custom font-semibold transition-colors"
                onClick={handleSubmit}
              >
                Create Area
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Areas Table */}
      <Card className="bg-text-white-custom text-detailing-outline-black shadow-lg rounded-lg p-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-detailing-outline-black">
            All Areas
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
                    Area ID
                  </th>
                  <th className="p-3 border-r border-detailing-outline-black font-semibold">
                    Drones
                  </th>
                  <th className="p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {areas.length === 0 ? (
                  <tr key="no-areas-row">
                    <td
                      colSpan={4}
                      className="p-4 text-center text-detailing-outline-black"
                    >
                      No areas found.
                    </td>
                  </tr>
                ) : (
                  areas.map((area: any) => (
                    <tr
                      key={area.id}
                      className="border-t border-detailing-outline-black hover:bg-shield-background-navy-blue hover:text-text-white-custom transition-colors"
                    >
                      <td className="p-3 border-r border-detailing-outline-black">
                        {editId === area.id ? (
                          <Input
                            className="h-9 border-detailing-outline-black focus:border-emblem-wreath-golden-yellow focus:ring-emblem-wreath-golden-yellow"
                            value={editValues[area.id]?.name || ""}
                            onChange={(e) =>
                              handleEditChange(area.id, "name", e.target.value)
                            }
                          />
                        ) : (
                          area.name
                        )}
                      </td>
                      <td className="p-3 border-r border-detailing-outline-black">
                        {editId === area.id ? (
                          <Input
                            className="h-9 border-detailing-outline-black focus:border-emblem-wreath-golden-yellow focus:ring-emblem-wreath-golden-yellow"
                            value={editValues[area.id]?.area_id || ""}
                            onChange={(e) =>
                              handleEditChange(
                                area.id,
                                "area_id",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          area.area_id
                        )}
                      </td>
                      <td className="p-3 border-r border-detailing-outline-black">
                        {area._count.drones || 0}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          {editId === area.id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleEditSave(area.id)}
                                className="bg-emblem-wreath-golden-yellow hover:bg-emblem-wreath-golden-yellow/90 text-detailing-outline-black font-semibold"
                              >
                                <Save className="w-4 h-4 mr-1" /> Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleEditCancel}
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
                                onClick={() => handleEditClick(area)}
                                className="p-2 bg-emblem-wreath-golden-yellow hover:bg-emblem-wreath-golden-yellow/90 text-detailing-outline-black border-detailing-outline-black"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(area.id)}
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
