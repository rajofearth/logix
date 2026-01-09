import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
    image: z.string().min(1, "Image data is required"),
});

interface ThreatDetectionResult {
    hasThreat: boolean;
    threatType: string | null;
    confidence: number;
    description: string;
    boundingBox?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

const THREAT_DETECTION_PROMPT = `Analyze this image from a package delivery camera feed. Detect any threats such as:
- Package damage or tampering
- Suspicious items or unauthorized access
- Structural integrity issues
- Any anomalies that could indicate security risks

You must respond with a valid JSON object only, no additional text. The JSON must have this exact structure:
{
  "hasThreat": boolean,
  "threatType": string | null,
  "confidence": number (0-100),
  "description": string,
  "boundingBox": { "x": number, "y": number, "width": number, "height": number } | null
}

If no threat is detected, set hasThreat to false and threatType to null. If a threat is detected, provide the threat type (e.g., "damage", "tampering", "suspicious_item", "structural_issue") and a clear description. The boundingBox should be provided in normalized coordinates (0-1) relative to the image dimensions if you can identify the threat location.`;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const parsed = requestSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request body", details: parsed.error.issues },
                { status: 400 }
            );
        }

        const { image } = parsed.data;

        // Extract base64 data if it's a data URL
        let base64Image = image;
        if (image.startsWith("data:image")) {
            base64Image = image.split(",")[1] || image;
        }

        if (!process.env.THREAT_MODEL_KEY) {
            console.error("THREAT_MODEL_KEY is not set");
            return NextResponse.json(
                { error: "AI service configuration error" },
                { status: 500 }
            );
        }

        // Initialize Gemini Flash Lite model
        // The google() function reads API key from GOOGLE_GENERATIVE_AI_API_KEY by default
        // We'll temporarily set it if THREAT_MODEL_KEY is provided
        const originalApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (process.env.THREAT_MODEL_KEY) {
            process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.THREAT_MODEL_KEY;
        }

        const model = google("gemini-flash-lite-latest");

        // Restore original API key if it existed
        if (originalApiKey) {
            process.env.GOOGLE_GENERATIVE_AI_API_KEY = originalApiKey;
        }

        // Generate threat detection analysis
        const result = await generateText({
            model,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: THREAT_DETECTION_PROMPT },
                        {
                            type: "image",
                            image: base64Image,
                        },
                    ],
                },
            ],
            temperature: 0.3, // Lower temperature for more consistent threat detection
        });

        // Parse the JSON response from the model
        let threatResult: ThreatDetectionResult;
        try {
            // Try to extract JSON from the response text
            const responseText = result.text.trim();
            // Remove markdown code blocks if present
            const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                            responseText.match(/```\s*([\s\S]*?)\s*```/) ||
                            [null, responseText];
            const jsonText = jsonMatch[1] || responseText;
            
            threatResult = JSON.parse(jsonText) as ThreatDetectionResult;

            // Validate the structure
            if (typeof threatResult.hasThreat !== "boolean") {
                throw new Error("Invalid response: hasThreat must be boolean");
            }
            if (typeof threatResult.confidence !== "number" || 
                threatResult.confidence < 0 || 
                threatResult.confidence > 100) {
                threatResult.confidence = threatResult.hasThreat ? 50 : 0;
            }
            if (!threatResult.description) {
                threatResult.description = threatResult.hasThreat 
                    ? "Threat detected" 
                    : "No threats detected";
            }
        } catch (parseError) {
            console.error("Failed to parse AI response:", parseError);
            console.error("Raw response:", result.text);
            
            // Fallback: try to infer threat from text response
            const lowerText = result.text.toLowerCase();
            const hasThreatKeywords = ["threat", "damage", "tamper", "suspicious", "anomaly", "risk", "danger"].some(
                keyword => lowerText.includes(keyword)
            );

            threatResult = {
                hasThreat: hasThreatKeywords,
                threatType: hasThreatKeywords ? "unknown" : null,
                confidence: hasThreatKeywords ? 60 : 0,
                description: result.text || "Analysis completed",
            };
        }

        return NextResponse.json(threatResult);
    } catch (error) {
        console.error("Threat detection error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        
        return NextResponse.json(
            { 
                error: "Failed to analyze threat",
                message: errorMessage,
                hasThreat: false,
                threatType: null,
                confidence: 0,
                description: "Error during analysis",
            },
            { status: 500 }
        );
    }
}
