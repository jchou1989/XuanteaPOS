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

-- Enable realtime for menu_items
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;

-- Create function to create menu_items table if it doesn't exist
CREATE OR REPLACE FUNCTION create_menu_items_if_not_exists()
RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'menu_items') THEN
    CREATE TABLE menu_items (
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
    
    -- Enable realtime for menu_items
    ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
  END IF;
END;
$$ LANGUAGE plpgsql;
