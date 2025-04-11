/*
  # Fix Activity Time Tracking Table Schema

  1. Changes
    - Create Activity_Time_Tracking table with correct column types
    - Add proper foreign key relationships
    - Add check constraint for end time
    - Add indexes for better performance

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS "Activity_Time_Tracking";

-- Create Activity_Time_Tracking table with correct column types
CREATE TABLE IF NOT EXISTS "Activity_Time_Tracking" (
  "Act_Time_Track_ID" bigint PRIMARY KEY,
  "Proj_Act_ID" bigint,
  "Project_ID" bigint REFERENCES "Projects"("Project_ID") ON DELETE CASCADE,
  "Act_ID" bigint REFERENCES "Activities"("Act_id") ON DELETE RESTRICT,
  "Org_ID" bigint REFERENCES "Resource_mgmt_Org"("Org_ID") ON DELETE RESTRICT,
  "Client_ID" text REFERENCES "Clients"("Client_ID") ON DELETE CASCADE,
  "Skill_ID" bigint,
  "Emp_ID" text REFERENCES "Employees"("Emp_id") ON DELETE RESTRICT,
  "Emp_Name" text NOT NULL,
  "Start_Time" timestamp without time zone NOT NULL,
  "End_Time" timestamp without time zone,
  CONSTRAINT time_tracking_end_time_check CHECK ("End_Time" IS NULL OR "End_Time" > "Start_Time")
);

-- Enable RLS
ALTER TABLE "Activity_Time_Tracking" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read time entries"
  ON "Activity_Time_Tracking"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert time entries"
  ON "Activity_Time_Tracking"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update time entries"
  ON "Activity_Time_Tracking"
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete time entries"
  ON "Activity_Time_Tracking"
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_time_tracking_emp_id ON "Activity_Time_Tracking"("Emp_ID");
CREATE INDEX IF NOT EXISTS idx_time_tracking_project_id ON "Activity_Time_Tracking"("Project_ID");
CREATE INDEX IF NOT EXISTS idx_time_tracking_act_id ON "Activity_Time_Tracking"("Act_ID");