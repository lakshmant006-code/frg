-- Add Team_Members_ID column to Team_Members table if it doesn't exist
ALTER TABLE "Team_Members"
ADD COLUMN IF NOT EXISTS "Team_Members_ID" bigint PRIMARY KEY;

-- Add Team_Name column to Team_Members table if it doesn't exist
ALTER TABLE "Team_Members"
ADD COLUMN IF NOT EXISTS "Team_Name" text;

-- Add Emp_Name column to Team_Members table if it doesn't exist
ALTER TABLE "Team_Members"
ADD COLUMN IF NOT EXISTS "Emp_Name" text;

-- Add Org_ID column to Team_Members table if it doesn't exist
ALTER TABLE "Team_Members"
ADD COLUMN IF NOT EXISTS "Org_ID" bigint REFERENCES "Resource_mgmt_Org"("Org_ID");

-- Drop the composite primary key if it exists
ALTER TABLE "Team_Members"
DROP CONSTRAINT IF EXISTS "Team_Members_pkey";

-- Add foreign key constraints
ALTER TABLE "Team_Members"
DROP CONSTRAINT IF EXISTS "Team_Members_Team_ID_fkey",
ADD CONSTRAINT "Team_Members_Team_ID_fkey"
  FOREIGN KEY ("Team_ID")
  REFERENCES "Teams"("Team_ID")
  ON UPDATE CASCADE
  ON DELETE CASCADE;

ALTER TABLE "Team_Members"
DROP CONSTRAINT IF EXISTS "Team_Members_Emp_ID_fkey",
ADD CONSTRAINT "Team_Members_Emp_ID_fkey"
  FOREIGN KEY ("Emp_ID")
  REFERENCES "Employees"("Emp_id")
  ON UPDATE CASCADE
  ON DELETE CASCADE;