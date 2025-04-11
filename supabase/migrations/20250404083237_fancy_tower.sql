/*
  # Remove unique constraint from Project_Activity_Resources table

  1. Changes
    - Remove the unique constraint on Client_ID column from Project_Activity_Resources table
    - This allows multiple resources to be assigned to activities for the same client

  2. Reasoning
    - Project_Activity_Resources should allow multiple records per client
    - Only Proj_Act_Resource_ID should be unique
    - Client_ID is a reference field and should not be unique
*/

DO $$ 
BEGIN
  -- Remove the unique constraint if it exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'Project_Activity_Resources_Client_ID_key'
    AND table_name = 'Project_Activity_Resources'
  ) THEN
    ALTER TABLE "Project_Activity_Resources" 
    DROP CONSTRAINT "Project_Activity_Resources_Client_ID_key";
  END IF;
END $$;