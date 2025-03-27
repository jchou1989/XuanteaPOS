-- Create stored procedures for menu items to avoid type issues

-- Get all menu items
CREATE OR REPLACE FUNCTION get_menu_items()
RETURNS SETOF menu_items
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM menu_items ORDER BY name;
END;
$$;

-- Add a menu item
CREATE OR REPLACE FUNCTION add_menu_item(
  id UUID,
  name TEXT,
  price DECIMAL,
  description TEXT,
  type TEXT,
  category TEXT,
  customization_options JSONB,
  customization_prices JSONB,
  customization_required JSONB,
  customization_multi_select JSONB,
  image TEXT
)
RETURNS SETOF menu_items
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY INSERT INTO menu_items (
    id,
    name,
    price,
    description,
    type,
    category,
    customization_options,
    customization_prices,
    customization_required,
    customization_multi_select,
    image
  ) VALUES (
    COALESCE(add_menu_item.id, uuid_generate_v4()),
    add_menu_item.name,
    add_menu_item.price,
    add_menu_item.description,
    add_menu_item.type,
    add_menu_item.category,
    add_menu_item.customization_options,
    add_menu_item.customization_prices,
    add_menu_item.customization_required,
    add_menu_item.customization_multi_select,
    add_menu_item.image
  ) RETURNING *;
END;
$$;

-- Update a menu item
CREATE OR REPLACE FUNCTION update_menu_item(
  id UUID,
  name TEXT,
  price DECIMAL,
  description TEXT,
  type TEXT,
  category TEXT,
  customization_options JSONB,
  customization_prices JSONB,
  customization_required JSONB,
  customization_multi_select JSONB,
  image TEXT
)
RETURNS SETOF menu_items
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY UPDATE menu_items SET
    name = update_menu_item.name,
    price = update_menu_item.price,
    description = update_menu_item.description,
    type = update_menu_item.type,
    category = update_menu_item.category,
    customization_options = update_menu_item.customization_options,
    customization_prices = update_menu_item.customization_prices,
    customization_required = update_menu_item.customization_required,
    customization_multi_select = update_menu_item.customization_multi_select,
    image = update_menu_item.image,
    updated_at = NOW()
  WHERE menu_items.id = update_menu_item.id
  RETURNING *;
END;
$$;

-- Delete a menu item
CREATE OR REPLACE FUNCTION delete_menu_item(item_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM menu_items WHERE id = item_id;
END;
$$;

-- Generic SQL execution function for fallbacks
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE sql_query INTO result;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;