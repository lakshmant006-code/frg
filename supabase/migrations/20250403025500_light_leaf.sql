/*
  # Create Projects Table

  1. New Tables
    - `Projects`
      - `Project_ID` (bigint, primary key)
      - `Proj_Name` (text, not null)
      - `Proj_Descr` (text)
      - `Client_ID` (text, foreign key)
      - `Org_ID` (bigint, foreign key)
      - `Proj_Start_Date` (date)
      - `Proj_Planned_End_Date` (date)
      - `Proj_Actual_End_date` (date)
      - `Proj_Add_Street1_1` (text)
      - `Proj_Add_Street2` (text)
      - `Proj_City` (text)
      - `Proj_County` (text)
      - `Proj_State` (text)
      - `Proj_Country` (text)
      - `Proj_Zipcode` (bigint)
      - `Proj_County_Zone` (text)
      - `Proj_Status` (boolean)
      - `Proj_Progress_Status` (text)
      - `Proj_Floor_Built_Area` (bigint)
      - `Proj_Wall_Area` (bigint)
      - `Proj_Roof_Area` (bigint)
      - `Proj_Scope_Area` (bigint)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create Projects table
CREATE TABLE IF NOT EXISTS "Projects" (
  "Project_ID" bigint PRIMARY KEY,
  "Proj_Name" text NOT NULL,
  "Proj_Descr" text,
  "Client_ID" text NOT NULL,
  "Org_ID" bigint NOT NULL REFERENCES "Resource_mgmt_Org"("Org_ID"),
  "Proj_Start_Date" date NOT NULL,
  "Proj_Planned_End_Date" date NOT NULL,
  "Proj_Actual_End_date" date,
  "Proj_Add_Street1_1" text NOT NULL,
  "Proj_Add_Street2" text,
  "Proj_City" text NOT NULL,
  "Proj_County" text,
  "Proj_State" text NOT NULL,
  "Proj_Country" text NOT NULL,
  "Proj_Zipcode" bigint NOT NULL,
  "Proj_County_Zone" text NOT NULL,
  "Proj_Status" boolean DEFAULT true,
  "Proj_Progress_Status" text DEFAULT 'Initiated',
  "Proj_Floor_Built_Area" bigint,
  "Proj_Wall_Area" bigint,
  "Proj_Roof_Area" bigint,
  "Proj_Scope_Area" bigint,
  CONSTRAINT projects_project_id_key UNIQUE ("Project_ID"),
  CONSTRAINT projects_client_id_fkey FOREIGN KEY ("Client_ID") REFERENCES "Clients"("Client_ID")
);

-- Enable RLS
ALTER TABLE "Projects" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read all projects"
  ON "Projects"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert projects"
  ON "Projects"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update projects"
  ON "Projects"
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete projects"
  ON "Projects"
  FOR DELETE
  TO authenticated
  USING (true);