import { prisma } from "@/lib/prisma";
import { openSkyConnector } from "@/lib/carriers/opensky";
import type { NextRequest } from "next/server";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function decimalToNumber(val: unknown): number | null {
    if (val === null || val === undefined) return null;
    if (typeof val === "number") return val;
    if (typeof val === "object" && val !== null && "toNumber" in val) {
        return (val as { toNumber: () => number }).toNumber();
    }
    return Number(val);
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ shipmentId: string }> }
) {
    const { shipmentId } = await params;

    if (!shipmentId) {
        return new Response("Shipment ID is required", { status: 400 });
    }

    // Verify shipment exists
    const shipment = await prisma.shipment.findUnique({
        where: { id: shipmentId },
        select: {
            id: true,
            status: true,
            segments: {
                where: { type: "air" },
                select: { id: true, icao24: true },
                take: 1,
            },
        },
    });

    if (!shipment) {
        return new Response("Shipment not found", { status: 404 });
    }

    const encoder = new TextEncoder();
    let lastEventAt: Date | null = null;
    let isActive = true;
    const airSegment = shipment.segments[0];

    const stream = new ReadableStream({
        async start(controller) {
            // Send initial connection event
            controller.enqueue(
                encoder.encode(`event: connected\ndata: ${JSON.stringify({ shipmentId })}\n\n`)
            );

            // Poll for updates every 5 seconds (balancing OpenSky rate limits)
            const poll = async () => {
                if (!isActive) return;

                try {
                    // Check if shipment is in terminal state
                    const currentShipment = await prisma.shipment.findUnique({
                        where: { id: shipmentId },
                        select: { status: true },
                    });

                    if (
                        currentShipment?.status === "delivered" ||
                        currentShipment?.status === "cancelled"
                    ) {
                        controller.enqueue(
                            encoder.encode(
                                `event: completed\ndata: ${JSON.stringify({ status: currentShipment.status })}\n\n`
                            )
                        );
                        isActive = false;
                        controller.close();
                        return;
                    }

                    // Get new events since last poll
                    const whereEvents: Record<string, unknown> = { shipmentId };
                    if (lastEventAt) {
                        whereEvents.createdAt = { gt: lastEventAt };
                    }

                    const newEvents = await prisma.shipmentEvent.findMany({
                        where: whereEvents,
                        orderBy: { createdAt: "asc" },
                        take: 10,
                    });

                    for (const event of newEvents) {
                        controller.enqueue(
                            encoder.encode(
                                `event: status_event\ndata: ${JSON.stringify({
                                    id: event.id,
                                    type: event.type,
                                    title: event.title,
                                    description: event.description,
                                    locationName: event.locationName,
                                    occurredAt: event.occurredAt.toISOString(),
                                })}\n\n`
                            )
                        );
                        lastEventAt = event.createdAt;
                    }

                    // Fetch aircraft position if we have an ICAO24
                    if (airSegment?.icao24) {
                        const position = await openSkyConnector.getAircraftPosition(
                            airSegment.icao24
                        );

                        if (position && position.latitude !== null && position.longitude !== null) {
                            // Store position in database
                            await prisma.airPositionPoint.create({
                                data: {
                                    segmentId: airSegment.id,
                                    timestamp: new Date(position.timestamp * 1000),
                                    latitude: position.latitude,
                                    longitude: position.longitude,
                                    baroAltitudeMeters: position.baroAltitudeMeters,
                                    velocityMps: position.velocityMps,
                                    heading: position.heading,
                                    onGround: position.onGround,
                                    source: "opensky",
                                },
                            }).catch(() => {
                                // Ignore duplicate errors
                            });

                            controller.enqueue(
                                encoder.encode(
                                    `event: air_position\ndata: ${JSON.stringify({
                                        icao24: position.icao24,
                                        callsign: position.callsign,
                                        latitude: position.latitude,
                                        longitude: position.longitude,
                                        altitude: position.baroAltitudeMeters,
                                        heading: position.heading,
                                        velocity: position.velocityMps,
                                        onGround: position.onGround,
                                        timestamp: new Date(position.timestamp * 1000).toISOString(),
                                    })}\n\n`
                                )
                            );
                        } else {
                            // No live position, try to get latest from database
                            const latestPosition = await prisma.airPositionPoint.findFirst({
                                where: { segmentId: airSegment.id },
                                orderBy: { timestamp: "desc" },
                            });

                            if (latestPosition) {
                                controller.enqueue(
                                    encoder.encode(
                                        `event: air_position\ndata: ${JSON.stringify({
                                            icao24: airSegment.icao24,
                                            callsign: null,
                                            latitude: decimalToNumber(latestPosition.latitude),
                                            longitude: decimalToNumber(latestPosition.longitude),
                                            altitude: decimalToNumber(latestPosition.baroAltitudeMeters),
                                            heading: decimalToNumber(latestPosition.heading),
                                            velocity: decimalToNumber(latestPosition.velocityMps),
                                            onGround: latestPosition.onGround,
                                            timestamp: latestPosition.timestamp.toISOString(),
                                            cached: true,
                                        })}\n\n`
                                    )
                                );
                            }
                        }
                    }

                    // Send heartbeat to keep connection alive
                    controller.enqueue(encoder.encode(`: heartbeat\n\n`));

                    // Schedule next poll
                    setTimeout(poll, 5000);
                } catch (error) {
                    console.error("[SSE Air Shipment] Error polling:", error);
                    if (isActive) {
                        controller.enqueue(
                            encoder.encode(
                                `event: error\ndata: ${JSON.stringify({ message: "Server error" })}\n\n`
                            )
                        );
                        setTimeout(poll, 10000); // Retry after 10s on error
                    }
                }
            };

            // Start polling
            poll();
        },
        cancel() {
            isActive = false;
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
        },
    });
}
