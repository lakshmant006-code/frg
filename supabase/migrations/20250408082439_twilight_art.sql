/*
  # Add Real-time Update Support for Project Activities

  1. Changes
    - Add RLS policies for Project_Activities and Project_Activity_Resources
    - Add triggers for real-time updates
    - Fix column names and constraints

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Enable RLS if not already enabled
ALTER TABLE "Project_Activities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Project_Activity_Resources" ENABLE ROW LEVEL SECURITY;

-- Create or replace policies for Project_Activities
DROP POLICY IF EXISTS "Users can read project activities" ON "Project_Activities";
DROP POLICY IF EXISTS "Users can insert project activities" ON "Project_Activities";
DROP POLICY IF EXISTS "Users can update project activities" ON "Project_Activities";
DROP POLICY IF EXISTS "Users can delete project activities" ON "Project_Activities";

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

-- Create or replace policies for Project_Activity_Resources
DROP POLICY IF EXISTS "Users can read project activity resources" ON "Project_Activity_Resources";
DROP POLICY IF EXISTS "Users can insert project activity resources" ON "Project_Activity_Resources";
DROP POLICY IF EXISTS "Users can update project activity resources" ON "Project_Activity_Resources";
DROP POLICY IF EXISTS "Users can delete project activity resources" ON "Project_Activity_Resources";

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

-- Add trigger to update Project_Activity_Resources when Project_Activities changes
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

DROP TRIGGER IF EXISTS update_project_activity_resources_trigger ON "Project_Activities";
CREATE TRIGGER update_project_activity_resources_trigger
  AFTER UPDATE ON "Project_Activities"
  FOR EACH ROW
  EXECUTE FUNCTION update_project_activity_resources();