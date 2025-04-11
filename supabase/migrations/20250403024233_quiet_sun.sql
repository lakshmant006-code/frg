/*
  # Update Roles Table Schema

  1. Changes
    - Create Roles table with correct column names including Org_ID
    - Add default roles with Org_ID reference
    - Add foreign key constraint to Resource_mgmt_Org
    
  2. Security
    - Enable RLS on Roles table
    - Add policies for role management
*/

-- First ensure we have the Resource_mgmt_Org table
CREATE TABLE IF NOT EXISTS "Resource_mgmt_Org" (
  "Org_ID" bigint PRIMARY KEY,
  "Org_name" text NOT NULL,
  "org_desc" text,
  "Org_Address_1" text NOT NULL,
  "Org_City" text NOT NULL,
  "Org_State" text NOT NULL,
  "Org_country" text NOT NULL,
  "Org_Zip_Code" numeric NOT NULL,
  "Org_Contact_Name" text NOT NULL
);

-- Insert default organization if it doesn't exist
INSERT INTO "Resource_mgmt_Org" ("Org_ID", "Org_name", "org_desc", "Org_Address_1", "Org_City", "Org_State", "Org_country", "Org_Zip_Code", "Org_Contact_Name")
VALUES (1, 'Default Organization', 'Default organization for the system', '123 Main St', 'City', 'State', 'Country', 12345, 'Admin')
ON CONFLICT ("Org_ID") DO NOTHING;

-- Create Roles table with correct columns
CREATE TABLE IF NOT EXISTS "Roles" (
  "Role_ID" bigint PRIMARY KEY,
  "Role_Name" text NOT NULL,
  "Role_Descr" text,
  "Org_ID" bigint NOT NULL REFERENCES "Resource_mgmt_Org"("Org_ID"),
  "Role_Status" boolean DEFAULT true,
  CONSTRAINT roles_role_name_key UNIQUE ("Role_Name")
);

-- Enable RLS
ALTER TABLE "Roles" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read roles"
  ON "Roles"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create roles"
  ON "Roles"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update roles"
  ON "Roles"
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete roles"
  ON "Roles"
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert default roles if they don't exist
INSERT INTO "Roles" ("Role_ID", "Role_Name", "Role_Descr", "Org_ID", "Role_Status")
VALUES 
  (1, 'Admin', 'Full system access with all administrative privileges', 1, true),
  (2, 'Manager', 'Team management and project oversight capabilities', 1, true),
  (3, 'Employee', 'Standard user access for time tracking and project work', 1, true)
ON CONFLICT ("Role_ID") DO NOTHING;