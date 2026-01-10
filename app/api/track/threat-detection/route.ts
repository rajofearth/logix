import "../../../../lib/ai-sdk-config";
import { NextRequest, NextResponse } from "next/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
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
    console.log("[Threat Detection] ===== Request received =====");
    try {
        const body = await req.json();
        console.log("[Threat Detection] Request body received, image data present:", !!body.image);
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

        // Initialize OpenRouter with qwen/qwen-2.5-vl-7b-instruct:free model
        console.log("[Threat Detection] Initializing OpenRouter...");
        const openrouter = createOpenRouter({
            apiKey: process.env.THREAT_MODEL_KEY,
        });

        const model = openrouter("qwen/qwen-2.5-vl-7b-instruct:free");
        console.log("[Threat Detection] Model initialized: qwen/qwen-2.5-vl-7b-instruct:free");
        console.log("[Threat Detection] Image data length:", base64Image.length, "characters");

        // Generate threat detection analysis
        console.log("[Threat Detection] Sending request to model...");
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

        console.log("[Threat Detection] Model response received");
        console.log("[Threat Detection] Raw response text:", result.text);
        console.log("[Threat Detection] Response length:", result.text.length, "characters");
        if (result.usage) {
            console.log("[Threat Detection] Token usage:", JSON.stringify(result.usage, null, 2));
        }

        // Parse the JSON response from the model
        let threatResult: ThreatDetectionResult;
        try {
            // Try to extract JSON from the response text
            const responseText = result.text.trim();
            console.log("[Threat Detection] Attempting to parse JSON from response...");
            
            // Remove markdown code blocks if present
            const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                            responseText.match(/```\s*([\s\S]*?)\s*```/) ||
                            [null, responseText];
            const jsonText = jsonMatch[1] || responseText;
            
            console.log("[Threat Detection] Extracted JSON text:", jsonText.substring(0, 200) + (jsonText.length > 200 ? "..." : ""));
            
            threatResult = JSON.parse(jsonText) as ThreatDetectionResult;
            console.log("[Threat Detection] Successfully parsed JSON:", JSON.stringify(threatResult, null, 2));

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
            
            console.log("[Threat Detection] Final parsed result:", {
                hasThreat: threatResult.hasThreat,
                threatType: threatResult.threatType,
                confidence: threatResult.confidence,
                description: threatResult.description,
                hasBoundingBox: !!threatResult.boundingBox,
            });
        } catch (parseError) {
            console.error("[Threat Detection] Failed to parse AI response:", parseError);
            console.error("[Threat Detection] Parse error details:", parseError instanceof Error ? parseError.message : String(parseError));
            console.error("[Threat Detection] Raw response text:", result.text);
            
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
            
            console.log("[Threat Detection] Using fallback parsing. Inferred result:", threatResult);
        }

        console.log("[Threat Detection] Returning response:", JSON.stringify(threatResult, null, 2));
        return NextResponse.json(threatResult);
    } catch (error) {
        console.error("[Threat Detection] ===== Error occurred =====");
        console.error("[Threat Detection] Error:", error);
        console.error("[Threat Detection] Error stack:", error instanceof Error ? error.stack : "No stack trace");
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
