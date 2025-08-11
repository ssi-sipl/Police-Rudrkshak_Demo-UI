"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { AlertTriangle, User, Dog, Plane, MapPin } from "lucide-react";

interface Alert {
  id: string;
  type: "person" | "animal";
  message: string;
  image?: string;
  timestamp: Date;
  confidence?: number;
  drone_id?: string;
  source?: "onboard" | "offboard";
}

interface DroneLocation {
  lat: number;
  long: number;
}

interface Session {
  id: number;
  name: string | null;
  startedAt: string;
  endedAt: string | null;
}

type SourceFilter = "all" | "onboard" | "offboard";
type ProcessingMode = "detection" | "facerecognition";

interface WebSocketContextType {
  activeSession: Session | null;
  isLoadingSession: boolean;
  startSession: (name: string) => Promise<void>;
  stopSession: () => Promise<void>;
  checkActiveSession: () => Promise<void>;
  currentAlert: Alert | null;
  setCurrentAlert: (alert: Alert | null) => void;
  currentLocation: DroneLocation | null;
  isConnected: boolean;
  connectionStatus: "connecting" | "connected" | "disconnected";
  sourceFilter: SourceFilter;
  setSourceFilter: (filter: SourceFilter) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  alertCount: number;
  lastAlertTime: Date | null;
  currentMode: ProcessingMode;
  isSwitchingMode: boolean;
  allModesOff: boolean;
  droneId: string;
  switchMode: (newMode: ProcessingMode) => Promise<void>;
  turnOffAllModes: () => Promise<void>;
  simulateAlert: () => void;
  getAlertIcon: (type: string) => React.ReactNode;
  getAlertColor: (type: string) => string;
  getSourceIcon: (source?: string) => React.ReactNode;
  getSourceColor: (source?: string) => string;
  formatTimestamp: (date: Date) => string;
  formatConfidence: (confidence?: number) => string | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Session state
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [currentAlert, setCurrentAlert] = useState<Alert | null>(null);
  const [currentLocation, setCurrentLocation] = useState<DroneLocation | null>(
    null
  );
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("disconnected");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [isPaused, setIsPaused] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [lastAlertTime, setLastAlertTime] = useState<Date | null>(null);
  const [currentMode, setCurrentMode] = useState<ProcessingMode>("detection");
  const [isSwitchingMode, setIsSwitchingMode] = useState(false);
  const [allModesOff, setAllModesOff] = useState(false);
  const [droneId] = useState("drone-1");

  const wsRef = useRef<WebSocket | null>(null);
  const alertBatchRef = useRef<Alert[]>([]);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isPausedRef = useRef(isPaused);
  const sourceFilterRef = useRef(sourceFilter);
  const setCurrentAlertRef = useRef(setCurrentAlert);

  // Fixed API URLs to remove double /api
  const API_BASE_URL = "http://localhost:5000/api";
  const WS_URL = "ws://localhost:5000";

  useEffect(() => {
    checkActiveSession();
  }, []);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    sourceFilterRef.current = sourceFilter;
  }, [sourceFilter]);

  useEffect(() => {
    setCurrentAlertRef.current = setCurrentAlert;
  }, [setCurrentAlert]);

  // WebSocket connection management
  useEffect(() => {
    const connectWebSocket = () => {
      if (
        wsRef.current &&
        (wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING)
      ) {
        console.log(
          "WebSocket already open or connecting, skipping new connection attempt."
        );
        return;
      }

      setConnectionStatus("connecting");
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setConnectionStatus("connected");
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === "alert" && message.data) {
            const alertData = message.data;
            const newAlert: Alert = {
              id: alertData.id || `alert-${Date.now()}-${Math.random()}`,
              type: alertData.type,
              message: alertData.message,
              image: alertData.image || "/placeholder.svg?height=300&width=400",
              timestamp: new Date(alertData.timestamp || Date.now()),
              confidence: alertData.confidence,
              drone_id: alertData.drone_id,
              source: message.source,
            };
            alertBatchRef.current.push(newAlert);

            if (
              !isPausedRef.current &&
              (sourceFilterRef.current === "all" ||
                sourceFilterRef.current === message.source)
            ) {
              setCurrentAlertRef.current(newAlert);
              setLastAlertTime(new Date());
              setTimeout(() => {
                setCurrentAlertRef.current((prev) =>
                  prev?.id === newAlert.id ? null : prev
                );
              }, 10000);
            }

            if (batchTimeoutRef.current) {
              clearTimeout(batchTimeoutRef.current);
            }
            batchTimeoutRef.current = setTimeout(() => {
              if (alertBatchRef.current.length > 0) {
                setAlertCount((prev) => prev + alertBatchRef.current.length);
                alertBatchRef.current = [];
              }
            }, 2000);
          } else if (message.type === "location" && message.data) {
            const { lat, long } = message.data;
            setCurrentLocation({ lat, long });
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        setConnectionStatus("disconnected");
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("disconnected");
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (
      currentAlert &&
      sourceFilter !== "all" &&
      currentAlert.source !== sourceFilter
    ) {
      setCurrentAlert(null);
    }
  }, [sourceFilter, currentAlert, setCurrentAlert]);

  const getAlertIcon = useCallback((type: string) => {
    switch (type) {
      case "person":
        return <User className="h-5 w-5" />;
      case "animal":
        return <Dog className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  }, []);

  const getAlertColor = useCallback((type: string) => {
    switch (type) {
      case "person":
        return "bg-red-500";
      case "animal":
        return "bg-orange-500";
      default:
        return "bg-yellow-500";
    }
  }, []);

  const getSourceIcon = useCallback((source?: string) => {
    switch (source) {
      case "onboard":
        return <Plane className="h-4 w-4" />;
      case "offboard":
        return <MapPin className="h-4 w-4" />;
      default:
        return null;
    }
  }, []);

  const getSourceColor = useCallback((source?: string) => {
    switch (source) {
      case "onboard":
        return "bg-blue-100 text-blue-800";
      case "offboard":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  const formatTimestamp = useCallback((date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, []);

  const checkActiveSession = async () => {
    setIsLoadingSession(true);
    try {
      // Fixed URL to remove double /api
      const response = await fetch(`${API_BASE_URL}/sessions/active`);

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const result = await response.json();
          if (result.status && result.data) {
            setActiveSession(result.data);
            setIsConnected(true);
            setConnectionStatus("connected");
            setAllModesOff(false);
          } else {
            setActiveSession(null);
            setIsConnected(false);
            setConnectionStatus("disconnected");
            setAllModesOff(true);
          }
        } else {
          console.log("API returned non-JSON response:", await response.text());
          setActiveSession(null);
          setIsConnected(false);
          setConnectionStatus("disconnected");
          setAllModesOff(true);
        }
      } else {
        console.log("API request failed with status:", response.status);
        setActiveSession(null);
        setIsConnected(false);
        setConnectionStatus("disconnected");
        setAllModesOff(true);
      }
    } catch (error) {
      console.error("Failed to check active session:", error);
      setActiveSession(null);
      setIsConnected(false);
      setConnectionStatus("disconnected");
      setAllModesOff(true);
    } finally {
      setIsLoadingSession(false);
    }
  };

  const startSession = async (name: string) => {
    try {
      // Fixed URL to remove double /api
      const response = await fetch(`${API_BASE_URL}/sessions/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const result = await response.json();
          if (result.status && result.data) {
            setActiveSession(result.data);
            setIsConnected(true);
            setConnectionStatus("connected");
            setAllModesOff(false);
            setCurrentMode("detection");
          }
        } else {
          console.log(
            "Start session API returned non-JSON response:",
            await response.text()
          );
        }
      } else {
        console.log(
          "Failed to start session - response not ok:",
          response.status
        );
      }
    } catch (error) {
      console.error("Failed to start session:", error);
    }
  };

  const stopSession = async () => {
    try {
      // Fixed URL to remove double /api
      const response = await fetch(`${API_BASE_URL}/sessions/stop`, {
        method: "POST",
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const result = await response.json();
          if (result.status) {
            setActiveSession(null);
            setIsConnected(false);
            setConnectionStatus("disconnected");
            setAllModesOff(true);
            setCurrentAlert(null);
          }
        } else {
          console.log(
            "Stop session API returned non-JSON response:",
            await response.text()
          );
        }
      } else {
        console.log(
          "Failed to stop session - response not ok:",
          response.status
        );
      }
    } catch (error) {
      console.error("Failed to stop session:", error);
    }
  };

  const formatConfidence = useCallback((confidence?: number) => {
    if (!confidence) return null;
    const percentage =
      confidence < 1 ? Math.round(confidence * 100) : Math.round(confidence);
    return `${percentage}%`;
  }, []);

  const simulateAlert = useCallback(() => {
    const sources: ("onboard" | "offboard")[] = ["onboard", "offboard"];
    const randomSource = sources[Math.floor(Math.random() * sources.length)];
    const mockAlert: Alert = {
      id: Date.now().toString(),
      type: Math.random() > 0.5 ? "person" : "animal",
      message:
        Math.random() > 0.5
          ? "Person detected in restricted area"
          : "Animal spotted near perimeter",
      timestamp: new Date(),
      confidence: Math.random() * 0.3 + 0.7,
      drone_id: "drone-1",
      image: "/placeholder.svg?height=300&width=400",
      source: randomSource,
    };
    const mockEvent = {
      data: JSON.stringify({
        type: "alert",
        source: randomSource,
        data: mockAlert,
      }),
    };
    if (wsRef.current && wsRef.current.onmessage) {
      wsRef.current.onmessage(mockEvent as MessageEvent);
    } else {
      console.warn(
        "WebSocket not ready for simulation, directly setting current alert."
      );
      if (
        !isPausedRef.current &&
        (sourceFilterRef.current === "all" ||
          sourceFilterRef.current === randomSource)
      ) {
        setCurrentAlertRef.current(mockAlert);
        setLastAlertTime(new Date());
        setTimeout(() => setCurrentAlertRef.current(null), 10000);
      }
      setAlertCount((prev) => prev + 1);
    }
  }, []);

  const switchMode = useCallback(
    async (newMode: ProcessingMode) => {
      setIsSwitchingMode(true);
      try {
        const endpoint =
          newMode === "facerecognition"
            ? `${API_BASE_URL}/process/facerecognition`
            : `${API_BASE_URL}/process/detection`;
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "on", drone_id: droneId }),
        });
        if (!response.ok) {
          console.error(`Failed to switch to ${newMode} mode`);
        } else {
          setCurrentMode(newMode);
          setAllModesOff(false);
          console.log(`Successfully switched to ${newMode} mode`);
        }
      } catch (error) {
        console.error("Error switching mode:", error);
      } finally {
        setIsSwitchingMode(false);
      }
    },
    [droneId]
  );

  const turnOffAllModes = useCallback(async () => {
    setIsSwitchingMode(true);
    try {
      const detectionResponse = await fetch(
        `${API_BASE_URL}/process/detection`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "off", drone_id: droneId }),
        }
      );
      const frResponse = await fetch(
        `${API_BASE_URL}/process/facerecognition`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "off", drone_id: droneId }),
        }
      );
      if (!detectionResponse.ok || !frResponse.ok) {
        console.error("Failed to turn off all modes");
      } else {
        setAllModesOff(true);
        console.log("Successfully turned off all modes");
      }
    } catch (error) {
      console.error("Error turning off all modes:", error);
    } finally {
      setIsSwitchingMode(false);
    }
  }, [droneId]);

  const contextValue = React.useMemo(
    () => ({
      activeSession,
      isLoadingSession,
      startSession,
      stopSession,
      checkActiveSession,
      currentAlert,
      setCurrentAlert,
      currentLocation,
      isConnected,
      connectionStatus,
      sourceFilter,
      setSourceFilter,
      isPaused,
      setIsPaused,
      alertCount,
      lastAlertTime,
      currentMode,
      isSwitchingMode,
      allModesOff,
      droneId,
      switchMode,
      turnOffAllModes,
      simulateAlert,
      getAlertIcon,
      getAlertColor,
      getSourceIcon,
      getSourceColor,
      formatTimestamp,
      formatConfidence,
    }),
    [
      activeSession,
      isLoadingSession,
      currentAlert,
      setCurrentAlert,
      currentLocation,
      isConnected,
      connectionStatus,
      sourceFilter,
      setSourceFilter,
      isPaused,
      setIsPaused,
      alertCount,
      lastAlertTime,
      currentMode,
      isSwitchingMode,
      allModesOff,
      droneId,
      switchMode,
      turnOffAllModes,
      simulateAlert,
      getAlertIcon,
      getAlertColor,
      getSourceIcon,
      getSourceColor,
      formatTimestamp,
      formatConfidence,
    ]
  );

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    console.error("useWebSocket must be used within a WebSocketProvider");
    return {} as WebSocketContextType;
  }
  return context;
};
