import { sandboxPost } from "./http";
import { getSandboxConfig } from "./config";
import type {
  AadhaarGenerateOtpRequest,
  AadhaarGenerateOtpResponseData,
  AadhaarVerifyOtpRequest,
  AadhaarVerifyOtpResponseData,
  PanVerifyDetailsRequest,
  PanVerifyDetailsResponseData,
  SandboxResponse,
} from "./types";

export async function sandboxAadhaarGenerateOtp(params: {
  aadhaarNumber: string;
  reason: string;
}): Promise<SandboxResponse<AadhaarGenerateOtpResponseData>> {
  const cfg = getSandboxConfig();
  const body: AadhaarGenerateOtpRequest = {
    "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
    aadhaar_number: params.aadhaarNumber,
    consent: "Y",
    reason: params.reason,
  };
  return sandboxPost<AadhaarGenerateOtpRequest, AadhaarGenerateOtpResponseData>(
    "/kyc/aadhaar/okyc/otp",
    body,
    { apiVersion: cfg.aadhaarApiVersion },
  );
}

export async function sandboxAadhaarVerifyOtp(params: {
  referenceId: string;
  otp: string;
}): Promise<SandboxResponse<AadhaarVerifyOtpResponseData>> {
  const cfg = getSandboxConfig();
  const body: AadhaarVerifyOtpRequest = {
    "@entity": "",
    reference_id: params.referenceId,
    otp: params.otp,
  };
  return sandboxPost<AadhaarVerifyOtpRequest, AadhaarVerifyOtpResponseData>(
    "/kyc/aadhaar/okyc/otp/verify",
    body,
    { apiVersion: cfg.aadhaarApiVersion },
  );
}

export async function sandboxPanVerifyDetails(params: {
  pan: string;
  nameAsPerPan: string;
  dateOfBirth: string;
  reason: string;
}): Promise<SandboxResponse<PanVerifyDetailsResponseData>> {
  /**
   * Sandbox API: Verify PAN Details
   * - Endpoint: POST /kyc/pan/verify (baseUrl defaults to https://api.sandbox.co.in)
   * - Auth: authorization header is the Sandbox JWT access token (NOT Bearer)
   * - Request body keys follow Sandbox naming: name_as_per_pan, date_of_birth, consent, reason
   */
  const body: PanVerifyDetailsRequest = {
    "@entity": "in.co.sandbox.kyc.pan_verification.request",
    pan: params.pan,
    name_as_per_pan: params.nameAsPerPan,
    date_of_birth: params.dateOfBirth,
    consent: "Y",
    reason: params.reason,
  };
  return sandboxPost<PanVerifyDetailsRequest, PanVerifyDetailsResponseData>("/kyc/pan/verify", body);
}

