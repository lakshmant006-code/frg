/*
  # Create Project Activities and Resources Tables

  1. New Tables
    - `Project_Activity_Resources`
      - `id` (uuid, primary key)
      - `project_id` (bigint, references Projects)
      - `activity_id` (bigint, references Activities)
      - `employee_id` (text, references Employees)
      - `hours_allocated` (numeric)
      - `skill_needed` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create Project Activity Resources table
CREATE TABLE IF NOT EXISTS "Project_Activity_Resources" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" bigint NOT NULL REFERENCES "Projects"("Project_ID") ON DELETE CASCADE,
  "activity_id" bigint NOT NULL REFERENCES "Activities"("Act_id") ON DELETE CASCADE,
  "employee_id" text NOT NULL REFERENCES "Employees"("Emp_id") ON DELETE CASCADE,
  "hours_allocated" numeric NOT NULL CHECK (hours_allocated >= 0),
  "skill_needed" text NOT NULL,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
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

-- Add updated_at trigger
CREATE TRIGGER update_project_activity_resources_updated_at
  BEFORE UPDATE ON "Project_Activity_Resources"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS project_activity_resources_project_id_idx 
  ON "Project_Activity_Resources"("project_id");

CREATE INDEX IF NOT EXISTS project_activity_resources_activity_id_idx 
  ON "Project_Activity_Resources"("activity_id");

CREATE INDEX IF NOT EXISTS project_activity_resources_employee_id_idx 
  ON "Project_Activity_Resources"("employee_id");