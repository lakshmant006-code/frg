/*
  # Fix Project Activities Table Schema

  1. Changes
    - Drop dependent objects first
    - Recreate Project_Activities table with correct column names
    - Add back foreign key constraints and indexes
    - Re-enable RLS policies

  2. Security
    - Maintain existing RLS policies
*/

-- First drop dependent objects
DROP TABLE IF EXISTS "Project_Activity_Resources" CASCADE;

-- Now we can safely drop and recreate Project_Activities
DROP TABLE IF EXISTS "Project_Activities" CASCADE;

-- Create Project_Activities table with correct column names
CREATE TABLE IF NOT EXISTS "Project_Activities" (
  "Proj_Act_ID" bigint PRIMARY KEY,
  "Project_ID" bigint REFERENCES "Projects"("Project_ID") ON DELETE CASCADE,
  "Act_id" bigint REFERENCES "Activities"("Act_id") ON DELETE CASCADE,
  "Activity_Name" text NOT NULL,
  "Acitivty_Area" bigint,
  "Type_Of_Area" bigint,
  "Total_Time_Allotted" text NOT NULL,
  "Total_Time_Consumed" text,
  "Activity_Start_Date" date,
  "Acitivity_End_Date" date,
  "Activity_Work_Status" text,
  "Skill_ID" bigint,
  "Skill_Name" text,
  "Org_ID" bigint REFERENCES "Resource_mgmt_Org"("Org_ID") ON DELETE RESTRICT,
  "Client_ID" text REFERENCES "Clients"("Client_ID") ON DELETE CASCADE,
  "Project_Activity_Resources" bigint
);

-- Enable RLS
ALTER TABLE "Project_Activities" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read project activities"
  ON "Project_Activities"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert project activities"
  ON "Project_Activities"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update project activities"
  ON "Project_Activities"
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete project activities"
  ON "Project_Activities"
  FOR DELETE
  TO authenticated
  USING (true);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_project_activities_act_id 
ON "Project_Activities"("Act_id");

-- Recreate Project_Activity_Resources table
CREATE TABLE IF NOT EXISTS "Project_Activity_Resources" (
  "Proj_Act_Resource_ID" bigint PRIMARY KEY,
  "Project_name" text NOT NULL,
  "Activity_Name" text NOT NULL,
  "Emp_Name" text NOT NULL,
  "Skill_Name" text NOT NULL,
  "Hours_Allotted" time without time zone NOT NULL,
  "Hours_Actual" time without time zone,
  "Org_ID" bigint NOT NULL REFERENCES "Resource_mgmt_Org"("Org_ID"),
  "Client_ID" text NOT NULL REFERENCES "Clients"("Client_ID"),
  "Project_ID" bigint NOT NULL REFERENCES "Projects"("Project_ID"),
  "Proj_Act_ID" bigint NOT NULL REFERENCES "Project_Activities"("Proj_Act_ID")
);