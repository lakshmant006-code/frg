/*
  # Create clients table

  1. New Tables
    - `clients`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text)
      - `client_id` (text, unique)
      - `address` (text)
      - `active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `clients` table
    - Add policies for authenticated users to perform CRUD operations
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS clients CASCADE;

-- Create the clients table
CREATE TABLE clients (
  Client_ID text PRIMARY KEY,
  Client_name text NOT NULL,
  Client_Dscr text,
  Client_Status boolean DEFAULT true,
  Client_Address_street_1 text,
  Client_Address_Street_2 text,
  Client_City text,
  Client_State text,
  Client_Country text,
  Client_ZIPCODE integer,
  Org_ID integer,
  Client_Contact_name text,
  Client_Phone bigint,
  Client_Website text,
  Client_Resource text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read all clients"
  ON clients
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert clients"
  ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update clients"
  ON clients
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete clients"
  ON clients
  FOR DELETE
  TO authenticated
  USING (true);

-- Create or replace the updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();