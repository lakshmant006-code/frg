/*
  # Fix Activity Time Tracking Table Relationships

  1. Changes
    - Drop existing foreign key constraints
    - Change Client_ID type from uuid to text to match Employees table
    - Add proper foreign key relationships
    - Update indexes for better query performance

  2. Security
    - Maintain existing RLS policies
*/

-- First drop existing foreign key constraints
ALTER TABLE "Activity_Time_Tracking"
DROP CONSTRAINT IF EXISTS "Activity_Time_Tracking_Project_ID_fkey",
DROP CONSTRAINT IF EXISTS "Activity_Time_Tracking_Act_ID_fkey",
DROP CONSTRAINT IF EXISTS "Activity_Time_Tracking_Org_ID_fkey",
DROP CONSTRAINT IF EXISTS "Activity_Time_Tracking_Emp_ID_fkey";

-- Change Client_ID type from uuid to text
ALTER TABLE "Activity_Time_Tracking"
ALTER COLUMN "Client_ID" TYPE text;

-- Re-add foreign key constraints with proper ON DELETE actions
ALTER TABLE "Activity_Time_Tracking"
ADD CONSTRAINT "Activity_Time_Tracking_Project_ID_fkey"
  FOREIGN KEY ("Project_ID")
  REFERENCES "Projects"("Project_ID")
  ON DELETE CASCADE,
ADD CONSTRAINT "Activity_Time_Tracking_Act_ID_fkey"
  FOREIGN KEY ("Act_ID")
  REFERENCES "Activities"("Act_id")
  ON DELETE RESTRICT,
ADD CONSTRAINT "Activity_Time_Tracking_Org_ID_fkey"
  FOREIGN KEY ("Org_ID")
  REFERENCES "Resource_mgmt_Org"("Org_ID")
  ON DELETE RESTRICT,
ADD CONSTRAINT "Activity_Time_Tracking_Emp_ID_fkey"
  FOREIGN KEY ("Emp_ID")
  REFERENCES "Employees"("Emp_id")
  ON DELETE RESTRICT;

-- Drop and recreate indexes for better performance
DROP INDEX IF EXISTS idx_time_tracking_emp_id;
DROP INDEX IF EXISTS idx_time_tracking_project_id;
DROP INDEX IF EXISTS idx_time_tracking_act_id;

CREATE INDEX idx_time_tracking_emp_id ON "Activity_Time_Tracking"("Emp_ID");
CREATE INDEX idx_time_tracking_project_id ON "Activity_Time_Tracking"("Project_ID");
CREATE INDEX idx_time_tracking_act_id ON "Activity_Time_Tracking"("Act_ID");