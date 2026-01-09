"use client";

import * as React from "react";
import { ThreatDetectionOverlay, type ThreatDetectionResult } from "./ThreatDetectionOverlay";

type CameraFeedStatus = "idle" | "requesting" | "ready" | "error";

export interface CameraFeedProps {
    title?: string;
    className?: string;
    autoStart?: boolean;
}

function getMediaErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) return error.message;
    return "Unable to access camera.";
}

export function CameraFeed({ title = "Camera", className, autoStart = true }: CameraFeedProps) {
    const videoRef = React.useRef<HTMLVideoElement | null>(null);
    const streamRef = React.useRef<MediaStream | null>(null);
    const isRequestingRef = React.useRef(false);
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const captureIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
    const [status, setStatus] = React.useState<CameraFeedStatus>("idle");
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    
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
        }

        if (stream) {
            for (const track of stream.getTracks()) track.stop();
        }

        // Clear threat detection interval
        if (captureIntervalRef.current) {
            clearInterval(captureIntervalRef.current);
            captureIntervalRef.current = null;
        }
    }, []);

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
            const videoEl = videoRef.current;
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
    }, [teardownStream]);

    // Capture frame and send for threat detection
    const captureFrame = React.useCallback(async () => {
        const videoEl = videoRef.current;
        if (!videoEl || status !== "ready" || isAnalyzing) return;

        try {
            setIsAnalyzing(true);
            
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
            setLastScanTime(new Date());
        } catch (error) {
            console.error("Threat detection error:", error);
            // Don't show error to user, just log it
        } finally {
            setIsAnalyzing(false);
        }
    }, [status, isAnalyzing]);

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

    React.useEffect(() => {
        if (!autoStart) return;
        void start();
        return () => {
            isRequestingRef.current = false;
            teardownStream();
        };
    }, [autoStart, start, teardownStream]);

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

                <div className="win7-aero-card-body p-2">
                    <div className="relative overflow-hidden rounded-[3px] border border-[#8e8f8f] bg-black">
                        <div className="aspect-video w-full relative">
                            <video
                                ref={videoRef}
                                className="h-full w-full object-cover"
                                muted
                                playsInline
                                autoPlay
                                onLoadedMetadata={(e) => {
                                    const target = e.currentTarget;
                                    setVideoDimensions({
                                        width: target.videoWidth || 640,
                                        height: target.videoHeight || 480,
                                    });
                                }}
                            />
                            
                            {/* Threat Detection Overlay */}
                            {status === "ready" && (
                                <ThreatDetectionOverlay
                                    result={threatResult}
                                    isLoading={isAnalyzing}
                                    videoWidth={videoDimensions.width}
                                    videoHeight={videoDimensions.height}
                                    onDismiss={() => setThreatResult(null)}
                                />
                            )}

                            {status !== "ready" && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
                                    <div className="max-w-[240px] text-center text-[11px] px-3">
                                        {status === "requesting" && <p>Requesting camera access…</p>}
                                        {status === "idle" && <p>Camera is stopped.</p>}
                                        {status === "error" && (
                                            <>
                                                <p className="font-semibold">Camera unavailable</p>
                                                {errorMessage && <p className="mt-1 opacity-90">{errorMessage}</p>}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Status indicator showing last scan time */}
                        {status === "ready" && lastScanTime && (
                            <div className="absolute bottom-2 left-2 z-10">
                                <div className="win7-aero-card bg-white/90">
                                    <div className="win7-aero-card-body p-1.5">
                                        <span className="text-[9px] text-gray-700">
                                            Last scan: {lastScanTime.toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

