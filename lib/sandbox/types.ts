export type SandboxSuccess<TData> = {
  code: number;
  timestamp: number;
  transaction_id: string;
  data: TData;
};

export type SandboxError = {
  code: number;
  timestamp: number;
  transaction_id: string;
  message: string;
};

export type SandboxResponse<TData> = SandboxSuccess<TData> | SandboxError;

export type SandboxAuthenticateData = {
  access_token: string;
};

export type AadhaarGenerateOtpRequest = {
  "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.request";
  aadhaar_number: string;
  consent: "Y" | "y";
  reason: string;
};

export type AadhaarGenerateOtpResponseData = {
  "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.response";
  reference_id: string | number;
  message: string;
};

export type AadhaarVerifyOtpRequest = {
  "@entity": "in.co.sandbox.kyc.aadhaar.okyc.request";
  /**
   * Sandbox docs specify reference_id as string for verify OTP.
   */
  reference_id: string;
  otp: string;
};

export type AadhaarVerifyOtpResponseData = {
  "@entity": string;
  reference_id: string;
  status?: string;
  message?: string;
  name?: string;
  date_of_birth?: string;
  year_of_birth?: string;
  gender?: string;
};

export type PanVerifyDetailsRequest = {
  "@entity": string;
  pan: string;
  name_as_per_pan: string;
  date_of_birth: string;
  consent: "Y" | "y";
  reason: string;
};

export type PanVerifyDetailsResponseData = {
  "@entity"?: string;
  pan?: string;
  status?: string;
  message?: string;
  name_as_per_pan_match?: string;
  date_of_birth_match?: string;
};

