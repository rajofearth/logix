import { NextRequest, NextResponse } from "next/server";
import type { MLPredictionRequest, MLPredictionResponse, PricePrediction, Product, LogisticsData, Warehouse } from "@/app/dashboard/warehouse/_components/types";
import { mapProductToMLRequest } from "@/lib/warehouse/ml-prediction-mapper";

const ML_API_BASE_URL = process.env.NEXT_PUBLIC_ML_API_URL || "https://143a5d566d4d.ngrok-free.app";

interface PredictionRequestBody {
    product: Product;
    logisticsData: LogisticsData;
    warehouse?: Warehouse;
}

interface BatchPredictionRequestBody {
    items: Array<{
        product: Product;
        logisticsData: LogisticsData;
        warehouse?: Warehouse;
    }>;
}

// Transform ML API response to our PricePrediction format
function transformMLResponse(mlResponse: MLPredictionResponse, initialValue: number): PricePrediction | null {
    if (!mlResponse.success || !mlResponse.prediction) {
        return null;
    }

    const { prediction, pricing, classification } = mlResponse;

    return {
        deviationRatio: prediction.deviationRatio,
        deviationRatioPercent: prediction.deviationRatioPercent,
        deviationINR: prediction.deviationINR,
        direction: prediction.direction,
        initialValueINR: prediction.initialValueINR,
        expectedFinalValueINR: prediction.expectedFinalValueINR,
        predictedReason: classification?.predictedReason,
        confidence: classification?.confidence,
        pricing: pricing ? {
            baseCost: pricing.baseCost,
            riskBuffer: pricing.riskBuffer,
            suggestedQuote: pricing.suggestedQuote,
        } : undefined,
    };
}

// Call external ML API
async function callMLAPI(requestData: MLPredictionRequest): Promise<MLPredictionResponse> {
    const url = `${ML_API_BASE_URL}/predict`;

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[ML API] Error response:", response.status, errorText);
            
            // Check for ngrok offline error
            if (response.status === 404 && errorText.includes("ngrok") && errorText.includes("offline")) {
                return {
                    success: false,
                    error: "ML API service is offline. Please check that the ngrok tunnel is running and the ML API server is accessible.",
                };
            }
            
            // Try to extract a meaningful error message
            let errorMessage = `ML API returned ${response.status}`;
            if (errorText.length < 500) {
                // Only include short error messages
                const htmlMatch = errorText.match(/<title>(.*?)<\/title>/i);
                if (htmlMatch) {
                    errorMessage = htmlMatch[1];
                } else if (!errorText.includes("<!DOCTYPE")) {
                    errorMessage = errorText.substring(0, 200);
                }
            }
            
            return {
                success: false,
                error: errorMessage,
            };
        }

        const data = await response.json();
        return data as MLPredictionResponse;
    } catch (error) {
        clearTimeout(timeoutId);
        console.error("[ML API] Request failed:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to call ML API";
        if (errorMessage.includes("aborted")) {
            return {
                success: false,
                error: "Request timeout: ML API did not respond within 30 seconds",
            };
        }
        return {
            success: false,
            error: errorMessage,
        };
    }
}

// Single prediction endpoint
export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as PredictionRequestBody | BatchPredictionRequestBody;

        // Check if it's a batch request
        if ("items" in body && Array.isArray(body.items)) {
            // Batch prediction
            const results = await Promise.all(
                body.items.map(async (item) => {
                    const mlRequest = mapProductToMLRequest(
                        item.product,
                        item.logisticsData,
                        item.warehouse
                    );

                    const mlResponse = await callMLAPI(mlRequest);
                    const prediction = transformMLResponse(
                        mlResponse,
                        item.product.currentPrice * item.product.quantity
                    );

                    return {
                        productId: item.product.id,
                        prediction,
                        error: mlResponse.error,
                    };
                })
            );

            return NextResponse.json({
                success: true,
                count: results.length,
                results,
            });
        } else {
            // Single prediction
            const { product, logisticsData, warehouse } = body as PredictionRequestBody;

            if (!product || !logisticsData) {
                return NextResponse.json(
                    { error: "Missing required fields: product and logisticsData" },
                    { status: 400 }
                );
            }

            // Map product to ML API format
            const mlRequest = mapProductToMLRequest(product, logisticsData, warehouse);

            // Call ML API
            const mlResponse = await callMLAPI(mlRequest);

            if (!mlResponse.success) {
                return NextResponse.json(
                    { error: mlResponse.error || "ML API request failed" },
                    { status: 500 }
                );
            }

            // Transform response
            const prediction = transformMLResponse(
                mlResponse,
                product.currentPrice * product.quantity
            );

            if (!prediction) {
                return NextResponse.json(
                    { error: "Failed to parse ML API response" },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                prediction,
            });
        }
    } catch (error) {
        console.error("[Price Prediction API] Error:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}
