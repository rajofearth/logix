"use client";

import * as React from "react";

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
    const [status, setStatus] = React.useState<CameraFeedStatus>("idle");
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    const teardownStream = React.useCallback(() => {
        const stream = streamRef.current;
        streamRef.current = null;

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        if (stream) {
            for (const track of stream.getTracks()) track.stop();
        }
    }, []);

    const stop = React.useCallback(() => {
        isRequestingRef.current = false;
        teardownStream();

        setStatus("idle");
        setErrorMessage(null);
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
            }

            setStatus("ready");
            isRequestingRef.current = false;
        } catch (err: unknown) {
            setStatus("error");
            setErrorMessage(getMediaErrorMessage(err));
            isRequestingRef.current = false;
        }
    }, [teardownStream]);

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
                        <div className="aspect-video w-full">
                            <video
                                ref={videoRef}
                                className="h-full w-full object-cover"
                                muted
                                playsInline
                                autoPlay
                            />
                        </div>

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
                </div>
            </div>
        </div>
    );
}

