/*
  # Create Activity Time Tracking Table

  1. New Tables
    - `Activity_Time_Tracking`
      - `Act_Time_Track_ID` (bigint, primary key)
      - `Proj_Act_ID` (bigint)
      - `Project_ID` (bigint)
      - `Act_ID` (bigint)
      - `Org_ID` (bigint)
      - `Client_ID` (uuid)
      - `Skill_ID` (bigint)
      - `Emp_ID` (string)
      - `Emp_Name` (text)
      - `Start_Time` (timestamp)
      - `End_Time` (timestamp, nullable)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create Activity_Time_Tracking table
CREATE TABLE IF NOT EXISTS "Activity_Time_Tracking" (
  "Act_Time_Track_ID" bigint PRIMARY KEY,
  "Proj_Act_ID" bigint,
  "Project_ID" bigint REFERENCES "Projects"("Project_ID") ON DELETE CASCADE,
  "Act_ID" bigint REFERENCES "Activities"("Act_id") ON DELETE RESTRICT,
  "Org_ID" bigint REFERENCES "Resource_mgmt_Org"("Org_ID") ON DELETE RESTRICT,
  "Client_ID" uuid,
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_time_tracking_emp_id ON "Activity_Time_Tracking"("Emp_ID");
CREATE INDEX IF NOT EXISTS idx_time_tracking_project_id ON "Activity_Time_Tracking"("Project_ID");
CREATE INDEX IF NOT EXISTS idx_time_tracking_act_id ON "Activity_Time_Tracking"("Act_ID");