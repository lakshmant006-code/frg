/*
  # Create Teams Table

  1. New Tables
    - `Teams`
      - `Team_ID` (bigint, primary key)
      - `Team_Name` (text, not null)
      - `Team_Descr` (text)
      - `Team_Lead` (text)
      - `Org_ID` (bigint, references Resource_mgmt_Org)
      - `Team_Status` (boolean)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create Teams table
CREATE TABLE IF NOT EXISTS "Teams" (
  "Team_ID" bigint PRIMARY KEY,
  "Team_Name" text NOT NULL,
  "Team_Descr" text,
  "Team_Lead" text,
  "Org_ID" bigint NOT NULL REFERENCES "Resource_mgmt_Org"("Org_ID"),
  "Team_Status" boolean DEFAULT true,
  CONSTRAINT teams_team_name_key UNIQUE ("Team_Name")
);

-- Enable RLS
ALTER TABLE "Teams" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read teams"
  ON "Teams"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create teams"
  ON "Teams"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update teams"
  ON "Teams"
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete teams"
  ON "Teams"
  FOR DELETE
  TO authenticated
  USING (true);