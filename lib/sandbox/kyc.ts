import { sandboxPost } from "./http";
import { getSandboxConfig } from "./config";
import type {
  AadhaarGenerateOtpRequest,
  AadhaarGenerateOtpResponseData,
  AadhaarVerifyOtpRequest,
  AadhaarVerifyOtpResponseData,
  PanAadhaarLinkStatusRequest,
  PanAadhaarLinkStatusResponseData,
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
  const body: PanVerifyDetailsRequest = {
    "@entity": "",
    pan: params.pan,
    name_as_per_pan: params.nameAsPerPan,
    date_of_birth: params.dateOfBirth,
    consent: "Y",
    reason: params.reason,
  };
  // Changelog indicates new endpoint: POST https://api.sandbox.co.in/kyc/pan
  return sandboxPost<PanVerifyDetailsRequest, PanVerifyDetailsResponseData>("/kyc/pan", body);
}

export async function sandboxPanAadhaarLinkStatus(params: {
  pan: string;
  aadhaarNumber: string;
  reason: string;
}): Promise<SandboxResponse<PanAadhaarLinkStatusResponseData>> {
  const body: PanAadhaarLinkStatusRequest = {
    "@entity": "_aadhaar.status",
    pan: params.pan,
    aadhaar_number: params.aadhaarNumber,
    consent: "Y",
    reason: params.reason,
  };
  return sandboxPost<PanAadhaarLinkStatusRequest, PanAadhaarLinkStatusResponseData>(
    "/kyc/pan-aadhaar/status",
    body,
  );
}


