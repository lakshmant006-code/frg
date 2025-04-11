/*
  # Create Project_Activity_Resources Table

  1. New Tables
    - `Project_Activity_Resources`
      - `Proj_Act_Resource_ID` (bigint, primary key)
      - `Project_name` (text)
      - `Activity_Name` (text)
      - `Emp_Name` (text)
      - `Skill_Name` (text)
      - `Hours_Allotted` (time)
      - `Hours_Actual` (time)
      - `Org_ID` (bigint)
      - `Client_ID` (text)
      - `Project_ID` (bigint)
      - `Proj_Act_ID` (bigint)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create Project_Activity_Resources table
CREATE TABLE IF NOT EXISTS "Project_Activity_Resources" (
  "Proj_Act_Resource_ID" bigint PRIMARY KEY,
  "Project_name" text NOT NULL,
  "Activity_Name" text NOT NULL,
  "Emp_Name" text NOT NULL,
  "Skill_Name" text NOT NULL,
  "Hours_Allotted" time NOT NULL,
  "Hours_Actual" time,
  "Org_ID" bigint NOT NULL REFERENCES "Resource_mgmt_Org"("Org_ID"),
  "Client_ID" text NOT NULL REFERENCES "Clients"("Client_ID"),
  "Project_ID" bigint NOT NULL REFERENCES "Projects"("Project_ID"),
  "Proj_Act_ID" bigint NOT NULL REFERENCES "Project_Activities"("Proj_Act_ID")
);

-- Enable RLS
ALTER TABLE "Project_Activity_Resources" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read project activity resources"
  ON "Project_Activity_Resources"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert project activity resources"
  ON "Project_Activity_Resources"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update project activity resources"
  ON "Project_Activity_Resources"
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete project activity resources"
  ON "Project_Activity_Resources"
  FOR DELETE
  TO authenticated
  USING (true);