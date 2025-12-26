import { driverAuth } from "@/lib/auth-driver";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(driverAuth);


