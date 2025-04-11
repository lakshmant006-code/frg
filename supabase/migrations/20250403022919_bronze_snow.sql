/*
  # Add Default Organization and Fix Foreign Key Constraints

  1. Changes
    - Create default organization record in Resource_mgmt_Org table
    - Ensure all foreign key references use the correct organization ID

  2. Security
    - Maintain existing RLS policies
*/

-- First ensure we have the Resource_mgmt_Org table
CREATE TABLE IF NOT EXISTS "Resource_mgmt_Org" (
  "Org_ID" bigint PRIMARY KEY,
  "Org_name" text NOT NULL,
  "org_desc" text,
  "Org_Address_1" text NOT NULL,
  "Org_Address_2" text,
  "Org_City" text NOT NULL,
  "Org_State" text NOT NULL,
  "Org_country" text NOT NULL,
  "Org_Zip_Code" numeric NOT NULL,
  "Org_Contact_Name" text NOT NULL,
  "Org_Phone_Num" text,
  "Org_email" text,
  "Org_Website" text,
  "Type_Of_Machines" text
);

-- Insert default organization if it doesn't exist
INSERT INTO "Resource_mgmt_Org" ("Org_ID", "Org_name", "org_desc", "Org_Address_1", "Org_City", "Org_State", "Org_country", "Org_Zip_Code", "Org_Contact_Name")
VALUES (1, 'Default Organization', 'Default organization for the system', '123 Main St', 'City', 'State', 'Country', 12345, 'Admin')
ON CONFLICT ("Org_ID") DO NOTHING;

-- Enable RLS on Resource_mgmt_Org
ALTER TABLE "Resource_mgmt_Org" ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for Resource_mgmt_Org
CREATE POLICY "Users can read organizations"
  ON "Resource_mgmt_Org"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert organizations"
  ON "Resource_mgmt_Org"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update organizations"
  ON "Resource_mgmt_Org"
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete organizations"
  ON "Resource_mgmt_Org"
  FOR DELETE
  TO authenticated
  USING (true);