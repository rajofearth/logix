"use client";

import * as React from "react";
import { ThreatDetectionOverlay, type ThreatDetectionResult } from "./ThreatDetectionOverlay";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type CameraFeedStatus = "idle" | "requesting" | "ready" | "error";
type VideoSource = "camera" | "test-video" | "custom-file";
type TestVideo = "aag" | "gira";

export interface CameraFeedProps {
    title?: string;
    className?: string;
    autoStart?: boolean;
    onThreatDetected?: (result: ThreatDetectionResult | null) => void;
    onAnalysisStateChange?: (isAnalyzing: boolean) => void;
    onLastScanTimeChange?: (time: Date | null) => void;
}

function getMediaErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) return error.message;
    return "Unable to access camera.";
}

export function CameraFeed({
    title = "Camera",
    className,
    autoStart = false,
    onThreatDetected,
    onAnalysisStateChange,
    onLastScanTimeChange,
}: CameraFeedProps) {
    const videoRef = React.useRef<HTMLVideoElement | null>(null);
    const streamRef = React.useRef<MediaStream | null>(null);
    const isRequestingRef = React.useRef(false);
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const captureIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
    const [status, setStatus] = React.useState<CameraFeedStatus>("idle");
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    
    // Test mode state
    const [testMode, setTestMode] = React.useState(false);
    const [videoSource, setVideoSource] = React.useState<VideoSource>("camera");
    const [selectedTestVideo, setSelectedTestVideo] = React.useState<TestVideo | null>(null);
    const [customVideoFile, setCustomVideoFile] = React.useState<File | null>(null);
    const [videoFileUrl, setVideoFileUrl] = React.useState<string | null>(null);
    
    // Threat detection state
    const [threatResult, setThreatResult] = React.useState<ThreatDetectionResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = React.useState(false);
    const [lastScanTime, setLastScanTime] = React.useState<Date | null>(null);
    const [videoDimensions, setVideoDimensions] = React.useState({ width: 0, height: 0 });

    const teardownStream = React.useCallback(() => {
        const stream = streamRef.current;
        streamRef.current = null;

        if (videoRef.current) {
            videoRef.current.srcObject = null;
            videoRef.current.src = "";
        }

        if (stream) {
            for (const track of stream.getTracks()) track.stop();
        }

        // Clean up video file URL
        if (videoFileUrl) {
            URL.revokeObjectURL(videoFileUrl);
            setVideoFileUrl(null);
        }

        // Clear threat detection interval
        if (captureIntervalRef.current) {
            clearInterval(captureIntervalRef.current);
            captureIntervalRef.current = null;
        }
    }, [videoFileUrl]);

    const stop = React.useCallback(() => {
        isRequestingRef.current = false;
        teardownStream();

        setStatus("idle");
        setErrorMessage(null);
        setThreatResult(null);
        setIsAnalyzing(false);
        setLastScanTime(null);
    }, [teardownStream]);

    const start = React.useCallback(async () => {
        if (isRequestingRef.current) return;

        isRequestingRef.current = true;
        teardownStream();
        setStatus("requesting");
        setErrorMessage(null);

        try {
            const videoEl = videoRef.current;
            if (!videoEl) {
                setStatus("error");
                setErrorMessage("Video element not available.");
                isRequestingRef.current = false;
                return;
            }

            // Handle video file mode
            if (testMode && (selectedTestVideo || customVideoFile)) {
                let videoSrc = "";

                if (customVideoFile) {
                    // Create object URL for custom video file
                    const url = URL.createObjectURL(customVideoFile);
                    setVideoFileUrl(url);
                    videoSrc = url;
                    setVideoSource("custom-file");
                } else if (selectedTestVideo) {
                    // Use test video from public folder
                    videoSrc = `/videos/${selectedTestVideo}.mp4`;
                    setVideoSource("test-video");
                }

                if (videoSrc) {
                    videoEl.src = videoSrc;
                    videoEl.loop = true;
                    await videoEl.play();
                    
                    // Update video dimensions
                    setVideoDimensions({
                        width: videoEl.videoWidth || 640,
                        height: videoEl.videoHeight || 480,
                    });

                    setStatus("ready");
                    isRequestingRef.current = false;
                    return;
                }
            }

            // Handle camera mode
            if (!navigator.mediaDevices?.getUserMedia) {
                setStatus("error");
                setErrorMessage("Camera is not supported in this browser.");
                isRequestingRef.current = false;
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" },
                audio: false,
            });

            streamRef.current = stream;
            setVideoSource("camera");
            
            if (videoEl) {
                videoEl.srcObject = stream;
                await videoEl.play();
                
                // Update video dimensions
                setVideoDimensions({
                    width: videoEl.videoWidth || 640,
                    height: videoEl.videoHeight || 480,
                });
            }

            setStatus("ready");
            isRequestingRef.current = false;
        } catch (err: unknown) {
            setStatus("error");
            setErrorMessage(getMediaErrorMessage(err));
            isRequestingRef.current = false;
        }
    }, [teardownStream, testMode, selectedTestVideo, customVideoFile]);

    // Capture frame and send for threat detection
    const captureFrame = React.useCallback(async () => {
        const videoEl = videoRef.current;
        if (!videoEl || status !== "ready" || isAnalyzing) return;

        try {
            setIsAnalyzing(true);
            onAnalysisStateChange?.(true);
            
            // Create canvas for frame capture
            const canvas = canvasRef.current || document.createElement("canvas");
            if (!canvasRef.current) {
                canvas.width = videoEl.videoWidth || 640;
                canvas.height = videoEl.videoHeight || 480;
                canvasRef.current = canvas;
            } else {
                canvas.width = videoEl.videoWidth || 640;
                canvas.height = videoEl.videoHeight || 480;
            }

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                throw new Error("Failed to get canvas context");
            }

            // Draw video frame to canvas
            ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

            // Convert to base64 (optimize size - max 1024px width)
            const maxWidth = 1024;
            let finalWidth = canvas.width;
            let finalHeight = canvas.height;
            
            if (canvas.width > maxWidth) {
                finalHeight = (canvas.height * maxWidth) / canvas.width;
                finalWidth = maxWidth;
            }

            const resizedCanvas = document.createElement("canvas");
            resizedCanvas.width = finalWidth;
            resizedCanvas.height = finalHeight;
            const resizedCtx = resizedCanvas.getContext("2d");
            if (resizedCtx) {
                resizedCtx.drawImage(canvas, 0, 0, finalWidth, finalHeight);
            }

            const imageData = resizedCanvas.toDataURL("image/jpeg", 0.8);

            // Send to threat detection API
            const response = await fetch("/api/track/threat-detection", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ image: imageData }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const result = (await response.json()) as ThreatDetectionResult;
            setThreatResult(result);
            const scanTime = new Date();
            setLastScanTime(scanTime);
            
            // Notify parent component
            onThreatDetected?.(result);
            onLastScanTimeChange?.(scanTime);
        } catch (error) {
            console.error("Threat detection error:", error);
            // Don't show error to user, just log it
        } finally {
            setIsAnalyzing(false);
            onAnalysisStateChange?.(false);
        }
    }, [status, isAnalyzing, onThreatDetected, onAnalysisStateChange, onLastScanTimeChange]);

    // Set up interval for frame capture (every 3 seconds)
    React.useEffect(() => {
        if (status !== "ready") {
            if (captureIntervalRef.current) {
                clearInterval(captureIntervalRef.current);
                captureIntervalRef.current = null;
            }
            return;
        }

        // Capture immediately on start
        void captureFrame();

        // Then capture every 3 seconds
        captureIntervalRef.current = setInterval(() => {
            void captureFrame();
        }, 3000);

        return () => {
            if (captureIntervalRef.current) {
                clearInterval(captureIntervalRef.current);
                captureIntervalRef.current = null;
            }
        };
    }, [status, captureFrame]);

    // Handle test mode changes
    React.useEffect(() => {
        if (!testMode) {
            setSelectedTestVideo(null);
            setCustomVideoFile(null);
            setVideoSource("camera");
            if (status === "ready") {
                stop();
            }
        }
    }, [testMode, status, stop]);

    React.useEffect(() => {
        if (!autoStart) return;
        void start();
        return () => {
            isRequestingRef.current = false;
            teardownStream();
        };
    }, [autoStart, start, teardownStream]);

    // Cleanup video file URL on unmount
    React.useEffect(() => {
        return () => {
            if (videoFileUrl) {
                URL.revokeObjectURL(videoFileUrl);
            }
        };
    }, [videoFileUrl]);

    return (
        <div className={className}>
            <div className="win7-aero-card">
                <div className="win7-aero-card-header">
                    <span className="text-[11px]">{title}</span>
                    <div className="flex items-center gap-2">
                        {status === "ready" ? (
                            <button type="button" className="win7-btn h-[22px] min-w-[60px] text-[10px]" onClick={stop}>
                                Stop
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="win7-btn h-[22px] min-w-[60px] text-[10px]"
                                onClick={() => void start()}
                                disabled={status === "requesting"}
                            >
                                Start
                            </button>
                        )}
                    </div>
                </div>

                {/* Test Mode Controls */}
                <div className="win7-aero-card-body p-2 border-t border-[#8e8f8f] bg-[#f0f0f0]">
                    <div className="flex items-center gap-3 mb-2">
                        <label className="flex items-center gap-2 text-[10px] text-[#222] cursor-pointer">
                            <Switch
                                checked={testMode}
                                onCheckedChange={setTestMode}
                                size="sm"
                            />
                            <span>Test Mode</span>
                        </label>
                    </div>

                    {testMode && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <label className="text-[10px] text-[#222] whitespace-nowrap">Test Video:</label>
                                <Select
                                    value={selectedTestVideo || ""}
                                    onValueChange={(value) => {
                                        setSelectedTestVideo(value as TestVideo);
                                        setCustomVideoFile(null);
                                    }}
                                >
                                    <SelectTrigger size="sm" className="h-6 text-[10px] min-w-[100px]">
                                        <SelectValue placeholder="Select video" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="aag">aag.mp4</SelectItem>
                                        <SelectItem value="gira">gira.mp4</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-[10px] text-[#222] whitespace-nowrap">Custom File:</label>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        setCustomVideoFile(file);
                                        if (file) {
                                            setSelectedTestVideo(null);
                                        }
                                    }}
                                    className="text-[10px] file:win7-btn file:h-6 file:text-[10px] file:mr-2 file:border-0 file:bg-transparent file:text-[#222] cursor-pointer"
                                />
                            </div>

                            {customVideoFile && (
                                <div className="text-[9px] text-[#666] truncate">
                                    Selected: {customVideoFile.name}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="win7-aero-card-body p-2">
                    <div className="relative overflow-hidden rounded-[3px] border border-[#8e8f8f] bg-black">
                        <div className="aspect-video w-full relative">
                            <video
                                ref={videoRef}
                                className="h-full w-full object-cover"
                                muted
                                playsInline
                                autoPlay
                                loop={testMode}
                                onLoadedMetadata={(e) => {
                                    const target = e.currentTarget;
                                    setVideoDimensions({
                                        width: target.videoWidth || 640,
                                        height: target.videoHeight || 480,
                                    });
                                }}
                            />
                            
                            {/* Threat Detection Overlay - Bounding Box with Enhanced Visibility */}
                            {status === "ready" && threatResult?.hasThreat && threatResult.boundingBox && (() => {
                                const { x, y, width, height } = threatResult.boundingBox;
                                
                                // Constrain coordinates to stay within 0-1 range and ensure minimum visibility
                                const constrainedX = Math.max(0, Math.min(0.95, x));
                                const constrainedY = Math.max(0, Math.min(0.95, y));
                                const constrainedWidth = Math.max(0.08, Math.min(1 - constrainedX, width)); // Min 8% width
                                const constrainedHeight = Math.max(0.08, Math.min(1 - constrainedY, height)); // Min 8% height
                                
                                // Calculate if label should be inside (if box is near top or right edge)
                                const labelInside = constrainedY < 0.12 || constrainedX + constrainedWidth > 0.88;
                                
                                return (
                                    <div
                                        className="absolute pointer-events-none z-20"
                                        style={{
                                            left: `${constrainedX * 100}%`,
                                            top: `${constrainedY * 100}%`,
                                            width: `${constrainedWidth * 100}%`,
                                            height: `${constrainedHeight * 100}%`,
                                        }}
                                    >
                                        {/* Pulsing bounding box border with glow effect */}
                                        <div
                                            className="absolute inset-0 border-[3px] border-red-500 bg-red-500/20"
                                            style={{
                                                boxShadow: `
                                                    0 0 0 1px rgba(239, 68, 68, 0.8),
                                                    0 0 10px rgba(239, 68, 68, 0.5),
                                                    0 0 20px rgba(239, 68, 68, 0.3),
                                                    inset 0 0 10px rgba(239, 68, 68, 0.2)
                                                `,
                                                animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                                            }}
                                        />
                                        
                                        {/* Corner markers for better visibility */}
                                        <div className="absolute -top-0.5 -left-0.5 w-5 h-5 border-t-[3px] border-l-[3px] border-red-600 bg-red-500/30" />
                                        <div className="absolute -top-0.5 -right-0.5 w-5 h-5 border-t-[3px] border-r-[3px] border-red-600 bg-red-500/30" />
                                        <div className="absolute -bottom-0.5 -left-0.5 w-5 h-5 border-b-[3px] border-l-[3px] border-red-600 bg-red-500/30" />
                                        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 border-b-[3px] border-r-[3px] border-red-600 bg-red-500/30" />
                                        
                                        {/* Threat label - smart positioning */}
                                        <div
                                            className={`absolute z-30 ${labelInside ? "top-1 left-1" : "-top-9 left-0"}`}
                                            style={{
                                                maxWidth: labelInside ? "calc(100% - 8px)" : "200px",
                                            }}
                                        >
                                            <div className="win7-btn bg-red-600 text-white text-[10px] px-2.5 py-1 h-auto min-h-0 border-red-700 shadow-xl whitespace-nowrap flex items-center gap-1.5 backdrop-blur-sm">
                                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                                <span className="font-semibold">{threatResult.threatType || "Threat"}</span>
                                                <span className="text-[9px] opacity-90 font-medium">({Math.round(threatResult.confidence)}%)</span>
                                            </div>
                                        </div>
                                        
                                        {/* Center indicator dot with ping animation */}
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                            <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg animate-ping" />
                                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                                        </div>
                                    </div>
                                );
                            })()}
                            
                            {/* Small loading indicator in corner */}
                            {status === "ready" && isAnalyzing && (
                                <div className="absolute top-2 right-2 z-10 pointer-events-none">
                                    <div className="win7-aero-card bg-white/90 backdrop-blur-sm">
                                        <div className="win7-aero-card-body p-1.5 flex items-center gap-1.5">
                                            <div className="animate-spin rounded-full h-2.5 w-2.5 border-b-2 border-[#3c7fb1]" />
                                            <span className="text-[9px]">Analyzing...</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {status !== "ready" && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
                                    <div className="max-w-[240px] text-center text-[11px] px-3">
                                        {status === "requesting" && (
                                            <p>
                                                {testMode
                                                    ? videoSource === "custom-file"
                                                        ? "Loading video file…"
                                                        : "Loading test video…"
                                                    : "Requesting camera access…"}
                                            </p>
                                        )}
                                        {status === "idle" && (
                                            <p>
                                                {testMode ? "Video is stopped." : "Camera is stopped."}
                                            </p>
                                        )}
                                        {status === "error" && (
                                            <>
                                                <p className="font-semibold">
                                                    {testMode ? "Video unavailable" : "Camera unavailable"}
                                                </p>
                                                {errorMessage && <p className="mt-1 opacity-90">{errorMessage}</p>}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

