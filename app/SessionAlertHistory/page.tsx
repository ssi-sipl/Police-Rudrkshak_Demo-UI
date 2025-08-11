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
  Activity,
  Clock,
} from "lucide-react";
import Image from "next/image";

interface Alert {
  id: number;
  type: "person" | "animal";
  message: string;
  image?: string;
  confidence?: number;
  source?: "onboard" | "offboard";
  createdAt: string;
  droneId: number;
  sessionId: number;
}

interface Session {
  id: number;
  name: string;
  startedAt: string;
  endedAt: string;
}

type DateFilter = "today" | "yesterday" | "last7days" | "last30days" | "all";
type SourceFilter = "all" | "onboard" | "offboard";

export default function SessionSelectorAlertsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);

  // Backend API URL - replace with your actual backend URL
  const API_BASE_URL = "http://localhost:5000/api";

  // Handle alert click - navigate to detail page
  const handleAlertClick = (alert: Alert) => {
    router.push(`/alert/${alert.id}`);
  };

  // Fetch all sessions
  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/`);
      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }
      const data = await response.json();
      console.log("Fetched sessions:", data);
      setSessions(data.data || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setSessions([]);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Fetch alerts for selected session
  const fetchSessionAlerts = async (sessionId: number) => {
    setIsLoadingAlerts(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/alert/session/${sessionId}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch alerts for session ${sessionId}`);
      }
      const data = await response.json();
      console.log("Fetched session alerts:", data);
      setAlerts(data.data || []);
    } catch (error) {
      console.error("Error fetching session alerts:", error);
      setAlerts([]);
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  // Handle session selection
  const handleSessionSelect = (sessionId: string) => {
    const session = sessions.find((s) => s.id.toString() === sessionId);
    if (session) {
      setSelectedSession(session);
      fetchSessionAlerts(session.id);
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
          const alertDate = new Date(alert.createdAt);
          const alertDateOnly = new Date(
            alertDate.getFullYear(),
            alertDate.getMonth(),
            alertDate.getDate()
          );
          return alertDateOnly.getTime() === today.getTime();
        });
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return filtered.filter((alert) => {
          const alertDate = new Date(alert.createdAt);
          const alertDateOnly = new Date(
            alertDate.getFullYear(),
            alertDate.getMonth(),
            alertDate.getDate()
          );
          return alertDateOnly.getTime() === yesterday.getTime();
        });
      case "last7days":
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return filtered.filter(
          (alert) => new Date(alert.createdAt) >= sevenDaysAgo
        );
      case "last30days":
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return filtered.filter(
          (alert) => new Date(alert.createdAt) >= thirtyDaysAgo
        );
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

  // Fetch initial sessions on component mount
  useEffect(() => {
    fetchSessions();
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "person":
        return <User className="h-5 w-5 text-detailing-outline-black" />;
      case "animal":
        return <Dog className="h-5 w-5 text-detailing-outline-black" />;
      default:
        return (
          <AlertTriangle className="h-5 w-5 text-detailing-outline-black" />
        );
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "person":
        return "bg-police-band-red";
      case "animal":
        return "bg-emblem-wreath-golden-yellow";
      default:
        return "bg-emblem-wreath-golden-yellow";
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
        return "bg-shield-background-navy-blue text-text-white-custom";
      case "offboard":
        return "bg-emblem-wreath-golden-yellow text-detailing-outline-black";
      default:
        return "bg-uniform-dark-navy-blue text-text-white-custom";
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDuration = (startedAt: string, endedAt: string) => {
    const start = new Date(startedAt);
    const end = new Date(endedAt);
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
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
        return "All time";
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
    <div className="min-h-screen bg-uniform-dark-navy-blue p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Camera className="h-8 w-8 text-emblem-wreath-golden-yellow" />
            <div>
              <h1 className="text-3xl font-bold text-text-white-custom">
                Session Alert History
              </h1>
              <p className="text-text-white-custom">
                Select a surveillance session to review its detection alerts and
                analytics.
              </p>
            </div>
          </div>
          <Button
            onClick={fetchSessions}
            variant="outline"
            size="sm"
            disabled={isLoadingSessions}
            className="border-text-white-custom text-text-white-custom hover:bg-shield-background-navy-blue hover:text-text-white-custom bg-transparent"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                isLoadingSessions ? "animate-spin" : ""
              }`}
            />
            Refresh Sessions
          </Button>
        </div>

        {/* Session Selector */}
        <Card className="bg-text-white-custom text-detailing-outline-black">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Select Session</span>
            </CardTitle>
            <CardDescription>
              Choose a surveillance session to view its alerts and analytics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Select
                value={selectedSession?.id.toString() || ""}
                onValueChange={handleSessionSelect}
                disabled={isLoadingSessions}
              >
                <SelectTrigger className="w-80 border-detailing-outline-black text-detailing-outline-black bg-text-white-custom">
                  <SelectValue
                    placeholder={
                      isLoadingSessions
                        ? "Loading sessions..."
                        : "Select a session"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{session.name}</span>
                        {/* <span className="text-sm text-gray-500 ml-4">
                          {formatTimestamp(session.startedAt)} •{" "}
                          {formatDuration(session.startedAt, session.endedAt)}
                        </span> */}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedSession && (
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatTimestamp(selectedSession.startedAt)}</span>
                  </div>
                  <span>
                    Duration:{" "}
                    {formatDuration(
                      selectedSession.startedAt,
                      selectedSession.endedAt
                    )}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Show content only when a session is selected */}
        {selectedSession && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-text-white-custom text-detailing-outline-black">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Alerts ({getDateFilterLabel(dateFilter)})
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-detailing-outline-black" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {filteredAlerts.length}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-text-white-custom text-detailing-outline-black">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Person Detections
                  </CardTitle>
                  <User className="h-4 w-4 text-detailing-outline-black" />
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
              <Card className="bg-text-white-custom text-detailing-outline-black">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Animal Detections
                  </CardTitle>
                  <Dog className="h-4 w-4 text-detailing-outline-black" />
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
              <Card className="bg-text-white-custom text-detailing-outline-black">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Source Distribution
                  </CardTitle>
                  <Plane className="h-4 w-4 text-detailing-outline-black" />
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
            <Card className="bg-text-white-custom text-detailing-outline-black">
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>
                      Alert History - {selectedSession.name}
                    </CardTitle>
                    <CardDescription>
                      Detection alerts from the selected surveillance session.
                      Click on any alert to view details.
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2 flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-detailing-outline-black" />
                      <Select
                        value={dateFilter}
                        onValueChange={(value: DateFilter) =>
                          setDateFilter(value)
                        }
                      >
                        <SelectTrigger className="w-40 border-detailing-outline-black text-detailing-outline-black bg-text-white-custom">
                          <SelectValue placeholder="Select Date Range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="yesterday">Yesterday</SelectItem>
                          <SelectItem value="last7days">Last 7 days</SelectItem>
                          <SelectItem value="last30days">
                            Last 30 days
                          </SelectItem>
                          <SelectItem value="all">All time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Plane className="h-4 w-4 text-detailing-outline-black" />
                      <Select
                        value={sourceFilter}
                        onValueChange={(value: SourceFilter) =>
                          setSourceFilter(value)
                        }
                      >
                        <SelectTrigger className="w-40 border-detailing-outline-black text-detailing-outline-black bg-text-white-custom">
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
                  {isLoadingAlerts ? (
                    <div className="text-center py-8 text-detailing-outline-black">
                      <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50 animate-spin" />
                      <p>Loading alerts for {selectedSession.name}...</p>
                    </div>
                  ) : filteredAlerts.length === 0 ? (
                    <div className="text-center py-8 text-detailing-outline-black">
                      <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>
                        No alerts found for{" "}
                        {getDateFilterLabel(dateFilter).toLowerCase()}
                        {sourceFilter !== "all" &&
                          ` from ${getSourceFilterLabel(
                            sourceFilter
                          ).toLowerCase()}`}{" "}
                        in {selectedSession.name}.
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
                            className="flex space-x-4 p-3 hover:bg-uniform-dark-navy-blue hover:text-text-white-custom rounded-lg transition-colors cursor-pointer"
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
                                  <ExternalLink className="h-4 w-4 text-detailing-outline-black" />
                                </div>
                                <div className="flex items-center space-x-4 text-xs text-detailing-outline-black">
                                  <span>
                                    {formatTimestamp(alert.createdAt)}
                                  </span>
                                  {alert.confidence && (
                                    <span>
                                      {formatConfidence(alert.confidence)}{" "}
                                      confidence
                                    </span>
                                  )}
                                  <span>Drone {alert.droneId}</span>
                                </div>
                              </div>
                              <div className="relative h-24 bg-uniform-dark-navy-blue rounded overflow-hidden">
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
                          {index < filteredAlerts.length - 1 && (
                            <Separator className="bg-detailing-outline-black" />
                          )}
                        </a>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </>
        )}

        {/* Show message when no session is selected */}
        {!selectedSession && !isLoadingSessions && sessions.length > 0 && (
          <Card className="bg-text-white-custom text-detailing-outline-black">
            <CardContent className="text-center py-12">
              <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Select a Session</h3>
              <p className="text-detailing-outline-black opacity-70">
                Choose a surveillance session from the dropdown above to view
                its alerts and analytics.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
