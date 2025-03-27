-- This migration fixes the previous error by not attempting to add tables to realtime publication
-- since they are already members of the publication

-- Ensure tables exist
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
