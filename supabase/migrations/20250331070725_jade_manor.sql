/*
  # Add activity number column to activities table

  1. Changes
    - Add activity_number column to activities table
    - Make it required and unique
    - Add index for better query performance

  2. Security
    - No changes to RLS policies needed
*/

-- Add activity_number column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activities' AND column_name = 'activity_number'
  ) THEN
    ALTER TABLE activities 
    ADD COLUMN activity_number text NOT NULL DEFAULT 'ACT' || floor(random() * 1000000)::text;

    -- Make it unique after initial data is populated
    ALTER TABLE activities 
    ADD CONSTRAINT activities_activity_number_unique UNIQUE (activity_number);

    -- Add index for better query performance
    CREATE INDEX IF NOT EXISTS activities_activity_number_idx ON activities (activity_number);
  END IF;
END $$;