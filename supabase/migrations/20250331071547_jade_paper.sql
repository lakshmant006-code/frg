/*
  # Add project_activities table

  1. New Tables
    - `project_activities`
      - `project_id` (uuid, foreign key to projects.id)
      - `activity_id` (uuid, foreign key to activities.id)
      - `hours_allocated` (numeric, not null)
      - Primary key is (project_id, activity_id)

  2. Security
    - Enable RLS on `project_activities` table
    - Add policies for authenticated users to manage project activities
*/

-- Create project_activities table
CREATE TABLE IF NOT EXISTS project_activities (
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  activity_id uuid REFERENCES activities(id) ON DELETE CASCADE,
  hours_allocated numeric NOT NULL CHECK (hours_allocated >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (project_id, activity_id)
);

-- Enable RLS
ALTER TABLE project_activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read project activities"
  ON project_activities
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert project activities"
  ON project_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update project activities"
  ON project_activities
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete project activities"
  ON project_activities
  FOR DELETE
  TO authenticated
  USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_project_activities_updated_at
  BEFORE UPDATE ON project_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();