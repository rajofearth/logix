-- Add enums
DO $$ BEGIN
  CREATE TYPE "VehicleOwnerType" AS ENUM ('self', 'company', 'rented');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add onboarding checkpoint fields to existing driver table (mapped as "users")
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "aadhaar_otp_reference_id" TEXT,
  ADD COLUMN IF NOT EXISTS "aadhaar_otp_generated_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "pan_aadhaar_link_status" TEXT,
  ADD COLUMN IF NOT EXISTS "pan_aadhaar_link_checked_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "vehicle_owner_type" "VehicleOwnerType",
  ADD COLUMN IF NOT EXISTS "vehicle_plate_no" TEXT,
  ADD COLUMN IF NOT EXISTS "is_vehicle_plate_verified" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "insurance_no" TEXT,
  ADD COLUMN IF NOT EXISTS "is_insurance_verified" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "insurance_file" TEXT,
  ADD COLUMN IF NOT EXISTS "insurance_file_key" TEXT;


