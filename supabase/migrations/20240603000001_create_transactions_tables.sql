-- Create transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  table_number TEXT,
  order_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  void_reason TEXT,
  voided_at TIMESTAMP WITH TIME ZONE,
  refund_reason TEXT,
  refunded_at TIMESTAMP WITH TIME ZONE,
  refund_amount DECIMAL(10, 2)
);

-- Create transaction_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS transaction_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL,
  customizations JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

-- Create policies for transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT id FROM auth.users WHERE auth.jwt() ->> 'role' = 'admin'
  ));

DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
CREATE POLICY "Users can insert their own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
CREATE POLICY "Users can update their own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT id FROM auth.users WHERE auth.jwt() ->> 'role' = 'admin'
  ));

-- Create policies for transaction_items
DROP POLICY IF EXISTS "Users can view transaction items" ON transaction_items;
CREATE POLICY "Users can view transaction items"
  ON transaction_items FOR SELECT
  USING (transaction_id IN (
    SELECT id FROM transactions WHERE auth.uid() = user_id OR auth.uid() IN (
      SELECT id FROM auth.users WHERE auth.jwt() ->> 'role' = 'admin'
    )
  ));

DROP POLICY IF EXISTS "Users can insert transaction items" ON transaction_items;
CREATE POLICY "Users can insert transaction items"
  ON transaction_items FOR INSERT
  WITH CHECK (transaction_id IN (
    SELECT id FROM transactions WHERE auth.uid() = user_id OR auth.uid() IS NOT NULL
  ));

-- Add tables to realtime publication
alter publication supabase_realtime add table transactions;
alter publication supabase_realtime add table transaction_items;
