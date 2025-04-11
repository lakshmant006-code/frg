/*
  # Fix Client ID Column Type and Related Tables

  1. Changes
    - Change Client_ID column from UUID to TEXT in Clients table
    - Update related foreign key columns in Projects and Project_Activity_Resources tables
    - Drop and recreate foreign key constraints
    - Maintain existing data

  2. Security
    - Maintain existing RLS policies
*/

-- Temporarily disable RLS
ALTER TABLE "Clients" DISABLE ROW LEVEL SECURITY;

-- Drop foreign key constraints
ALTER TABLE "Projects" DROP CONSTRAINT IF EXISTS "Projects_Client_ID_fkey";
ALTER TABLE "Project_Activity_Resources" DROP CONSTRAINT IF EXISTS "Project_Activity_Resources_Client_ID_fkey";

-- Change column types to text
ALTER TABLE "Clients" ALTER COLUMN "Client_ID" TYPE text;
ALTER TABLE "Projects" ALTER COLUMN "Client_ID" TYPE text;
ALTER TABLE "Project_Activity_Resources" ALTER COLUMN "Client_ID" TYPE text;

-- Recreate foreign key constraints
ALTER TABLE "Projects" 
  ADD CONSTRAINT "Projects_Client_ID_fkey" 
  FOREIGN KEY ("Client_ID") 
  REFERENCES "Clients"("Client_ID") 
  ON UPDATE CASCADE 
  ON DELETE RESTRICT;

ALTER TABLE "Project_Activity_Resources" 
  ADD CONSTRAINT "Project_Activity_Resources_Client_ID_fkey" 
  FOREIGN KEY ("Client_ID") 
  REFERENCES "Clients"("Client_ID") 
  ON UPDATE CASCADE 
  ON DELETE RESTRICT;

-- Re-enable RLS
ALTER TABLE "Clients" ENABLE ROW LEVEL SECURITY;