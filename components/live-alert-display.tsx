"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Wifi,
  WifiOff,
  Camera,
  RefreshCw,
  Play,
  Square,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { useWebSocket } from "./websocket-provider";

function SessionStartForm() {
  const [sessionName, setSessionName] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const { startSession } = useWebSocket();

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionName.trim()) return;

    setIsStarting(true);
    try {
      await startSession(sessionName.trim());
      setSessionName("");
    } catch (error) {
      console.error("Failed to start session:", error);
      // You could add toast notification here
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Card className="bg-text-white-custom text-detailing-outline-black">
      <CardContent className="py-6">
        <div className="text-center space-y-4">
          {/* <div className="space-y-2">
            <h3 className="text-lg font-semibold text-detailing-outline-black">
              No Active Session
            </h3>
            <p className="text-sm text-gray-600">
              Start a new session to begin receiving live alerts and enable
              processing modes.
            </p>
          </div> */}

          <form
            onSubmit={handleStartSession}
            className="space-y-4 max-w-md mx-auto"
          >
            <div className="space-y-2">
              <Label htmlFor="sessionName" className="text-sm font-medium">
                Session Name
              </Label>
              <Input
                id="sessionName"
                type="text"
                placeholder="Enter session name to start recieving live alerts"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                className="border-detailing-outline-black"
                disabled={isStarting}
              />
            </div>

            <Button
              type="submit"
              disabled={!sessionName.trim() || isStarting}
              className="w-full bg-shield-background-navy-blue hover:bg-uniform-dark-navy-blue text-text-white-custom"
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting Session...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Session
                </>
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

function ActiveSessionControls() {
  const [isStopping, setIsStopping] = useState(false);
  const {
    activeSession,
    isConnected,
    connectionStatus,
    sourceFilter,
    setSourceFilter,
    currentMode,
    isSwitchingMode,
    allModesOff,
    droneId,
    switchMode,
    turnOffAllModes,
    simulateAlert,
    getSourceIcon,
    stopSession,
  } = useWebSocket();

  const handleStopSession = async () => {
    setIsStopping(true);
    try {
      await stopSession();
    } catch (error) {
      console.error("Failed to stop session:", error);
      // You could add toast notification here
    } finally {
      setIsStopping(false);
    }
  };

  return (
    <Card className="bg-text-white-custom text-detailing-outline-black">
      <CardContent className="py-4 space-y-4">
        {/* Session Info Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="font-medium">Active Session:</span>
              <Badge variant="outline" className="font-mono">
                {activeSession?.name || `Session-${activeSession?.id}`}
              </Badge>
            </div>
          </div>

          <Button
            onClick={handleStopSession}
            disabled={isStopping}
            variant="outline"
            size="sm"
            className="border-police-band-red text-police-band-red hover:bg-police-band-red hover:text-text-white-custom bg-transparent"
          >
            {isStopping ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Stopping...
              </>
            ) : (
              <>
                <Square className="w-4 h-4 mr-2" />
                Stop Session
              </>
            )}
          </Button>
        </div>

        <Separator className="bg-detailing-outline-black" />

        {/* Processing Mode Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-shield-background-navy-blue" />
              <span className="font-medium">Processing Mode:</span>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => switchMode("detection")}
                variant={
                  currentMode === "detection" && !allModesOff
                    ? "default"
                    : "outline"
                }
                size="sm"
                disabled={isSwitchingMode}
                className={
                  currentMode === "detection" && !allModesOff
                    ? "bg-shield-background-navy-blue hover:bg-uniform-dark-navy-blue text-text-white-custom"
                    : "border-detailing-outline-black text-detailing-outline-black hover:bg-uniform-dark-navy-blue hover:text-text-white-custom"
                }
              >
                {currentMode === "detection" && !allModesOff && (
                  <div className="w-2 h-2 bg-emblem-wreath-golden-yellow rounded-full mr-2" />
                )}
                Detection
              </Button>
              <Button
                onClick={() => switchMode("facerecognition")}
                variant={
                  currentMode === "facerecognition" && !allModesOff
                    ? "default"
                    : "outline"
                }
                size="sm"
                disabled={isSwitchingMode}
                className={
                  currentMode === "facerecognition" && !allModesOff
                    ? "bg-uniform-dark-navy-blue hover:bg-shield-background-navy-blue text-text-white-custom"
                    : "border-detailing-outline-black text-detailing-outline-black hover:bg-uniform-dark-navy-blue hover:text-text-white-custom"
                }
              >
                {currentMode === "facerecognition" && !allModesOff && (
                  <div className="w-2 h-2 bg-emblem-wreath-golden-yellow rounded-full mr-2" />
                )}
                Face Recognition
              </Button>
              <Separator
                orientation="vertical"
                className="h-6 hidden sm:block bg-detailing-outline-black"
              />
              <Button
                onClick={turnOffAllModes}
                variant={allModesOff ? "default" : "outline"}
                size="sm"
                disabled={isSwitchingMode}
                className={
                  allModesOff
                    ? "bg-police-band-red hover:bg-police-band-red/90 text-text-white-custom"
                    : "border-detailing-outline-black text-detailing-outline-black hover:bg-police-band-red hover:text-text-white-custom hover:border-police-band-red"
                }
              >
                {allModesOff && (
                  <div className="w-2 h-2 bg-emblem-wreath-golden-yellow rounded-full mr-2" />
                )}
                Turn Off All
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm flex-wrap gap-2">
            <div className="text-sm text-detailing-outline-black">
              <span>Status: </span>
              <Badge variant={allModesOff ? "destructive" : "default"}>
                {allModesOff
                  ? "All Off"
                  : currentMode === "detection"
                  ? "Detection Active"
                  : "Face Recognition Active"}
              </Badge>
            </div>
            <div className="text-sm text-detailing-outline-black">
              <span>Drone ID: </span>
              <Badge variant="outline">{droneId}</Badge>
            </div>
            {isSwitchingMode && (
              <div className="flex items-center space-x-2 text-sm text-detailing-outline-black">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Switching mode...</span>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-4 bg-detailing-outline-black" />

        {/* Alert Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-detailing-outline-black">
                Source:
              </span>
              <div className="flex items-center bg-uniform-dark-navy-blue rounded-lg p-1">
                <Button
                  onClick={() => setSourceFilter("all")}
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-3 text-xs text-text-white-custom ${
                    sourceFilter === "all"
                      ? "bg-shield-background-navy-blue shadow-sm"
                      : "hover:bg-shield-background-navy-blue/80"
                  }`}
                >
                  All
                </Button>
                <Button
                  onClick={() => setSourceFilter("onboard")}
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-3 text-xs text-text-white-custom ${
                    sourceFilter === "onboard"
                      ? "bg-shield-background-navy-blue shadow-sm"
                      : "hover:bg-shield-background-navy-blue/80"
                  }`}
                >
                  {getSourceIcon("onboard")}
                  <span className="ml-1 capitalize">Onboard</span>
                </Button>
                <Button
                  onClick={() => setSourceFilter("offboard")}
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-3 text-xs text-text-white-custom ${
                    sourceFilter === "offboard"
                      ? "bg-shield-background-navy-blue shadow-sm"
                      : "hover:bg-shield-background-navy-blue/80"
                  }`}
                >
                  {getSourceIcon("offboard")}
                  <span className="ml-1 capitalize">Offboard</span>
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-police-band-red" />
              )}
              <span
                className={`text-sm font-medium ${
                  isConnected ? "text-green-500" : "text-police-band-red"
                }`}
              >
                {connectionStatus.charAt(0).toUpperCase() +
                  connectionStatus.slice(1)}
              </span>
            </div>
            <Button
              onClick={simulateAlert}
              variant="outline"
              size="sm"
              className="border-detailing-outline-black text-detailing-outline-black hover:bg-uniform-dark-navy-blue hover:text-text-white-custom bg-transparent"
            >
              Simulate Live Alert
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LiveAlertDisplay() {
  const {
    activeSession,
    isLoadingSession,
    currentAlert,
    isPaused,
    getAlertIcon,
    getAlertColor,
    getSourceIcon,
    getSourceColor,
    formatTimestamp,
    formatConfidence,
    setCurrentAlert,
  } = useWebSocket();

  if (isLoadingSession) {
    return (
      <div className="space-y-6">
        <Card className="bg-text-white-custom text-detailing-outline-black">
          <CardContent className="py-8">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin text-shield-background-navy-blue" />
              <span className="text-detailing-outline-black">
                Checking for active session...
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Management */}
      {activeSession ? <ActiveSessionControls /> : <SessionStartForm />}

      {/* Current Alert - Only show if session is active */}
      {activeSession && currentAlert && !isPaused && (
        <Card className={`${getAlertColor(currentAlert.type)} animate-pulse`}>
          <a
            href={`/alert/${currentAlert.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <CardContent className="py-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getAlertIcon(currentAlert.type)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">LIVE ALERT</span>
                          <Badge variant="destructive" className="text-xs">
                            Active
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {currentAlert.type}
                          </Badge>
                          {currentAlert.source && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${getSourceColor(
                                currentAlert.source
                              )}`}
                            >
                              {getSourceIcon(currentAlert.source)}
                              <span className="ml-1 capitalize">
                                {currentAlert.source}
                              </span>
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {currentAlert.message}
                        </p>
                        <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                          <span>{formatTimestamp(currentAlert.timestamp)}</span>
                          {currentAlert.confidence && (
                            <span>
                              {formatConfidence(currentAlert.confidence)}{" "}
                              confidence
                            </span>
                          )}
                          {currentAlert.drone_id && (
                            <span>{currentAlert.drone_id}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentAlert(null)}
                    >
                      &times;
                    </Button>
                  </div>
                </div>
                <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={
                      currentAlert.image ||
                      "/placeholder.svg?height=300&width=400"
                    }
                    alt="Detection"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </CardContent>
          </a>
        </Card>
      )}
    </div>
  );
}
