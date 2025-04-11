/*
  # Create Time Tracking Table

  1. New Tables
    - `time_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `project_id` (bigint, references Projects)
      - `activity_id` (bigint, references Activities)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `duration` (interval)
      - `description` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS time_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id bigint REFERENCES "Projects"("Project_ID") ON DELETE CASCADE,
  activity_id bigint REFERENCES "Activities"("Act_id") ON DELETE CASCADE,
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  duration interval,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own time entries"
  ON time_entries
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own time entries"
  ON time_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own time entries"
  ON time_entries
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own time entries"
  ON time_entries
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create trigger for updating duration on end_time change
CREATE OR REPLACE FUNCTION update_time_entry_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NOT NULL THEN
    NEW.duration = NEW.end_time - NEW.start_time;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_duration_trigger
  BEFORE UPDATE OF end_time ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_time_entry_duration();