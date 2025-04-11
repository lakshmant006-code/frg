/*
  # Create Employees Table

  1. New Tables
    - `Employees`
      - `Emp_id` (text, primary key)
      - `Emp_First_Name` (text)
      - `Emp_Last_Name` (text)
      - `Emp_email` (text)
      - `Emp_Phone` (text)
      - `Emp_Date_Joined` (date)
      - `Emp_Street_1` (text)
      - `Emp_Street_2` (text)
      - `Emp_City` (text)
      - `Emp_State` (text)
      - `Emp_Country` (text)
      - `Emp_Zipcode` (text)
      - `Emp_working_shift` (text)
      - `Emp_Status` (boolean)
      - `Emp_Date_Termination` (date)
      - `Org_ID` (bigint, references Resource_mgmt_Org)
      - `Role_ID` (bigint, references Roles)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create Employees table
CREATE TABLE IF NOT EXISTS "Employees" (
  "Emp_id" text PRIMARY KEY,
  "Emp_First_Name" text NOT NULL,
  "Emp_Last_Name" text NOT NULL,
  "Emp_email" text UNIQUE NOT NULL,
  "Emp_Phone" text,
  "Emp_Date_Joined" date,
  "Emp_Street_1" text,
  "Emp_Street_2" text,
  "Emp_City" text,
  "Emp_State" text,
  "Emp_Country" text,
  "Emp_Zipcode" text,
  "Emp_working_shift" text,
  "Emp_Status" boolean DEFAULT true,
  "Emp_Date_Termination" date,
  "Org_ID" bigint NOT NULL REFERENCES "Resource_mgmt_Org"("Org_ID"),
  "Role_ID" bigint REFERENCES "Roles"("Role_ID"),
  CONSTRAINT employees_email_key UNIQUE ("Emp_email")
);

-- Enable RLS
ALTER TABLE "Employees" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read all employees" ON "Employees";
  DROP POLICY IF EXISTS "Users can insert employees" ON "Employees";
  DROP POLICY IF EXISTS "Users can update employees" ON "Employees";
  DROP POLICY IF EXISTS "Users can delete employees" ON "Employees";
END $$;

-- Create policies
CREATE POLICY "Users can read all employees"
  ON "Employees"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert employees"
  ON "Employees"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update employees"
  ON "Employees"
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete employees"
  ON "Employees"
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert a default admin employee if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "Employees" WHERE "Emp_id" = 'EMP001') THEN
    INSERT INTO "Employees" (
      "Emp_id",
      "Emp_First_Name",
      "Emp_Last_Name",
      "Emp_email",
      "Org_ID",
      "Role_ID",
      "Emp_Status"
    )
    VALUES (
      'EMP001',
      'Admin',
      'User',
      'admin@company.com',
      1,
      1,
      true
    );
  END IF;
END $$;