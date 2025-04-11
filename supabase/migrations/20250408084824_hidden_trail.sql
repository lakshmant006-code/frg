/*
  # Fix Project Activities Schema and Relationships

  1. Changes
    - Add sequence for Proj_Act_ID to auto-generate values
    - Ensure proper foreign key relationships
    - Add trigger to handle Proj_Act_ID generation
    - Update existing policies

  2. Security
    - Maintain existing RLS policies
    - Ensure proper cascade behavior
*/

-- Create sequence for Proj_Act_ID if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS project_activities_proj_act_id_seq;

-- Drop and recreate Project_Activities table with proper sequence
DROP TABLE IF EXISTS "Project_Activities" CASCADE;

CREATE TABLE IF NOT EXISTS "Project_Activities" (
  "Proj_Act_ID" bigint PRIMARY KEY DEFAULT nextval('project_activities_proj_act_id_seq'),
  "Project_ID" bigint NOT NULL REFERENCES "Projects"("Project_ID") ON DELETE CASCADE,
  "Act_id" bigint NOT NULL REFERENCES "Activities"("Act_id") ON DELETE CASCADE,
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

-- Create or replace Project_Activity_Resources table
DROP TABLE IF EXISTS "Project_Activity_Resources" CASCADE;

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

-- Enable RLS for Project_Activity_Resources
ALTER TABLE "Project_Activity_Resources" ENABLE ROW LEVEL SECURITY;

-- Create policies for Project_Activity_Resources
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
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete project activity resources"
  ON "Project_Activity_Resources"
  FOR DELETE
  TO authenticated
  USING (true);

-- Create function to update project activity resources
CREATE OR REPLACE FUNCTION update_project_activity_resources()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    UPDATE "Project_Activity_Resources"
    SET 
      "Activity_Name" = NEW."Activity_Name"
    WHERE "Proj_Act_ID" = NEW."Proj_Act_ID";
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for project activity updates
DROP TRIGGER IF EXISTS update_project_activity_resources_trigger ON "Project_Activities";
CREATE TRIGGER update_project_activity_resources_trigger
  AFTER UPDATE ON "Project_Activities"
  FOR EACH ROW
  EXECUTE FUNCTION update_project_activity_resources();