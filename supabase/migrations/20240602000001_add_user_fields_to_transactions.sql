-- Add user_id and created_by fields to transactions table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'user_id') THEN
    ALTER TABLE transactions ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'created_by') THEN
    ALTER TABLE transactions ADD COLUMN created_by TEXT;
  END IF;
END $$;