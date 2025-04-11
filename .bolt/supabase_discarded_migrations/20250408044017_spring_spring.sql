/*
  # Add Timer Table and Functions

  1. New Tables
    - `timers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `project_id` (bigint, references Projects)
      - `activity_id` (bigint, references Activities)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `description` (text)
      - `is_running` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for users to manage their own timers
*/

CREATE TABLE IF NOT EXISTS timers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id bigint REFERENCES "Projects"("Project_ID") ON DELETE CASCADE,
  activity_id bigint REFERENCES "Activities"("Act_id") ON DELETE CASCADE,
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  description text,
  is_running boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE timers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own timers"
  ON timers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own timers"
  ON timers
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own timers"
  ON timers
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own timers"
  ON timers
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create trigger for updating updated_at
CREATE TRIGGER update_timers_updated_at
  BEFORE UPDATE ON timers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();