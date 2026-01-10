/**
 * AI SDK Configuration
 * 
 * Suppresses AI SDK warnings about specification version compatibility.
 * This is set globally to avoid repeated warnings in the console.
 */
if (typeof globalThis !== "undefined") {
    (globalThis as { AI_SDK_LOG_WARNINGS?: boolean }).AI_SDK_LOG_WARNINGS = false;
}
