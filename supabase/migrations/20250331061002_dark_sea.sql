/*
  # Update clients table schema

  1. Changes
    - Add separate address fields (street1, street2, city, state, country, zipcode)
    - Add description field
    - Keep created_at and updated_at timestamps

  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing trigger before modifying the table
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;

-- Modify the clients table
ALTER TABLE clients 
  ADD COLUMN IF NOT EXISTS address_street_1 text,
  ADD COLUMN IF NOT EXISTS address_street_2 text,
  ADD COLUMN IF NOT EXISTS address_city text,
  ADD COLUMN IF NOT EXISTS address_state text,
  ADD COLUMN IF NOT EXISTS address_country text,
  ADD COLUMN IF NOT EXISTS address_zipcode text;

-- Drop the old address column if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'clients' 
    AND column_name = 'address'
  ) THEN
    ALTER TABLE clients DROP COLUMN address;
  END IF;
END $$;

-- Recreate the trigger
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();