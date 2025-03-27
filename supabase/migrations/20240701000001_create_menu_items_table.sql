-- Create menu_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  category TEXT,
  customization_options JSONB,
  customization_prices JSONB,
  customization_required JSONB,
  customization_multi_select JSONB,
  preparation_notes TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to ensure the table exists
CREATE OR REPLACE FUNCTION create_menu_items_if_not_exists()
RETURNS void AS $$
BEGIN
  -- Function body is empty since we're creating the table directly above
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Check if the table is already in the realtime publication before adding it
DO $$
DECLARE
  publication_exists BOOLEAN;
  table_in_publication BOOLEAN;
BEGIN
  -- Check if the publication exists
  SELECT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) INTO publication_exists;
  
  IF publication_exists THEN
    -- Check if the table is already in the publication
    SELECT EXISTS (
      SELECT 1 
      FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'menu_items'
    ) INTO table_in_publication;
    
    -- Only add to publication if it's not already there
    IF NOT table_in_publication THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
    END IF;
  END IF;
END $$;