"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  User,
  Dog,
  Camera,
  Calendar,
  RefreshCw,
  ExternalLink,
  Plane,
  MapPin,
} from "lucide-react";
import Image from "next/image";

interface Alert {
  id: string;
  type: "person" | "animal";
  message: string;
  image?: string;
  timestamp: Date;
  confidence?: number;
  drone_id?: string;
  source?: "onboard" | "offboard"; // Add source field
}

type DateFilter = "today" | "yesterday" | "last7days" | "last30days" | "all";
type SourceFilter = "all" | "onboard" | "offboard";

export default function AlertHistoryPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [isLoading, setIsLoading] = useState(false);

  // Backend API URL - replace with your actual backend URL
  const API_BASE_URL = "http://localhost:5000/api";

  // Handle alert click - navigate to detail page
  const handleAlertClick = (alert: Alert) => {
    router.push(`/alert/${alert.id}`);
  };

  // Fetch alert history from backend
  const fetchAlertHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/alert`);
      if (!response.ok) {
        throw new Error("Failed to fetch alerts");
      }
      const data = await response.json();
      console.log("Fetched alert history:", data);
      const transformedAlerts: Alert[] =
        data?.data?.map((alert: any) => ({
          id: alert.id || `alert-${Date.now()}-${Math.random()}`,
          type: alert.type,
          message: alert.message,
          image: alert.image || "/placeholder.svg?height=300&width=400",
          timestamp: new Date(alert.createdAt || alert.timestamp || Date.now()),
          confidence: alert.confidence,
          drone_id: alert.drone_id,
          source: alert.source || "onboard", // Default to onboard if not specified
        })) || [];
      console.log("Transformed alerts:", transformedAlerts);
      setAlerts(transformedAlerts);
    } catch (error) {
      console.error("Error fetching alert history:", error);
      // Set empty array on error to prevent undefined issues
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter alerts based on selected date range and source
  const filterAlerts = (
    alerts: Alert[],
    dateFilter: DateFilter,
    sourceFilter: SourceFilter
  ): Alert[] => {
    let filtered = alerts;

    // Filter by source first
    if (sourceFilter !== "all") {
      filtered = filtered.filter((alert) => alert.source === sourceFilter);
    }

    // Then filter by date
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateFilter) {
      case "today":
        return filtered.filter((alert) => {
          const alertDate = new Date(
            alert.timestamp.getFullYear(),
            alert.timestamp.getMonth(),
            alert.timestamp.getDate()
          );
          return alertDate.getTime() === today.getTime();
        });
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return filtered.filter((alert) => {
          const alertDate = new Date(
            alert.timestamp.getFullYear(),
            alert.timestamp.getMonth(),
            alert.timestamp.getDate()
          );
          return alertDate.getTime() === yesterday.getTime();
        });
      case "last7days":
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return filtered.filter((alert) => alert.timestamp >= sevenDaysAgo);
      case "last30days":
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return filtered.filter((alert) => alert.timestamp >= thirtyDaysAgo);
      case "all":
      default:
        return filtered;
    }
  };

  // Update filtered alerts when alerts, date filter, or source filter changes
  useEffect(() => {
    const filtered = filterAlerts(alerts, dateFilter, sourceFilter);
    setFilteredAlerts(filtered);
  }, [alerts, dateFilter, sourceFilter]);

  // Fetch initial data on component mount
  useEffect(() => {
    fetchAlertHistory();
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "person":
        return <User className="h-5 w-5" />;
      case "animal":
        return <Dog className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "person":
        return "bg-red-500";
      case "animal":
        return "bg-orange-500";
      default:
        return "bg-yellow-500";
    }
  };

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case "onboard":
        return <Plane className="h-4 w-4" />;
      case "offboard":
        return <MapPin className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getSourceColor = (source?: string) => {
    switch (source) {
      case "onboard":
        return "bg-blue-100 text-blue-800";
      case "offboard":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getDateFilterLabel = (filter: DateFilter) => {
    switch (filter) {
      case "today":
        return "Today";
      case "yesterday":
        return "Yesterday";
      case "last7days":
        return "Last 7 days";
      case "last30days":
        return "Last 30 days";
      case "all":
        return "All time";
      default:
        return "Today";
    }
  };

  const getSourceFilterLabel = (filter: SourceFilter) => {
    switch (filter) {
      case "all":
        return "All Sources";
      case "onboard":
        return "Onboard";
      case "offboard":
        return "Offboard";
      default:
        return "All Sources";
    }
  };

  const formatConfidence = (confidence?: number) => {
    if (!confidence) return null;
    const percentage =
      confidence < 1 ? Math.round(confidence * 100) : Math.round(confidence);
    return `${percentage}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Camera className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Alert History
              </h1>
              <p className="text-gray-600">
                Review past detection alerts from your drone surveillance
                system.
              </p>
            </div>
          </div>
          <Button
            onClick={fetchAlertHistory}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Alerts ({getDateFilterLabel(dateFilter)})
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredAlerts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Person Detections
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  filteredAlerts.filter((alert) => alert.type === "person")
                    .length
                }
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Animal Detections
              </CardTitle>
              <Dog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  filteredAlerts.filter((alert) => alert.type === "animal")
                    .length
                }
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Onboard vs Offboard
              </CardTitle>
              <Plane className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Onboard:</span>
                  <span className="font-semibold">
                    {
                      filteredAlerts.filter(
                        (alert) => alert.source === "onboard"
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Offboard:</span>
                  <span className="font-semibold">
                    {
                      filteredAlerts.filter(
                        (alert) => alert.source === "offboard"
                      ).length
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert History List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Alert History</CardTitle>
                <CardDescription>
                  All detection alerts from your drone surveillance system.
                  Click on any alert to view details.
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={dateFilter}
                    onValueChange={(value: DateFilter) => setDateFilter(value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select Date Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                      <SelectItem value="last7days">Last 7 days</SelectItem>
                      <SelectItem value="last30days">Last 30 days</SelectItem>
                      <SelectItem value="all">All time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Plane className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={sourceFilter}
                    onValueChange={(value: SourceFilter) =>
                      setSourceFilter(value)
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select Source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      <SelectItem value="onboard">Onboard</SelectItem>
                      <SelectItem value="offboard">Offboard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50 animate-spin" />
                  <p>Loading alerts...</p>
                </div>
              ) : filteredAlerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>
                    No alerts found for{" "}
                    {getDateFilterLabel(dateFilter).toLowerCase()}
                    {sourceFilter !== "all" &&
                      ` from ${getSourceFilterLabel(
                        sourceFilter
                      ).toLowerCase()}`}
                    .
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAlerts.map((alert, index) => (
                    <a
                      key={alert.id}
                      href={`/alert/${alert.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <div
                        className="flex space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                        onClick={() => handleAlertClick(alert)}
                      >
                        <div
                          className={`w-3 h-3 rounded-full mt-2 ${getAlertColor(
                            alert.type
                          )}`}
                        />
                        <div className="flex-1 grid md:grid-cols-3 gap-4">
                          <div className="md:col-span-2 space-y-1">
                            <div className="flex items-center space-x-2">
                              {getAlertIcon(alert.type)}
                              <span className="font-medium text-sm">
                                {alert.message}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {alert.type}
                              </Badge>
                              {alert.source && (
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getSourceColor(
                                    alert.source
                                  )}`}
                                >
                                  {getSourceIcon(alert.source)}
                                  <span className="ml-1 capitalize">
                                    {alert.source}
                                  </span>
                                </Badge>
                              )}
                              <ExternalLink className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{formatTimestamp(alert.timestamp)}</span>
                              {alert.confidence && (
                                <span>
                                  {formatConfidence(alert.confidence)}{" "}
                                  confidence
                                </span>
                              )}
                              {alert.drone_id && <span>{alert.drone_id}</span>}
                            </div>
                          </div>
                          <div className="relative h-24 bg-gray-100 rounded overflow-hidden">
                            <Image
                              src={
                                alert.image ||
                                "/placeholder.svg?height=300&width=400"
                              }
                              alt="Detection"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      </div>
                      {index < filteredAlerts.length - 1 && <Separator />}
                    </a>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
