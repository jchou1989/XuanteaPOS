-- Create menu_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  category TEXT,
  customization_options JSONB,
  customization_prices JSONB,
  customization_required JSONB,
  customization_multi_select JSONB,
  preparation_notes TEXT,
  image TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
DROP POLICY IF EXISTS "Public access" ON menu_items;
CREATE POLICY "Public access"
ON menu_items FOR SELECT
USING (true);

-- Create policy for authenticated users to insert/update/delete
DROP POLICY IF EXISTS "Authenticated users can modify" ON menu_items;
CREATE POLICY "Authenticated users can modify"
ON menu_items FOR ALL
USING (auth.role() = 'authenticated');

-- Enable realtime
alter publication supabase_realtime add table menu_items;