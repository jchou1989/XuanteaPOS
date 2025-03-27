-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to insert into the users table
DROP POLICY IF EXISTS "Allow inserts to users table" ON users;
CREATE POLICY "Allow inserts to users table"
ON users FOR INSERT
WITH CHECK (true);

-- Create a policy that allows users to select their own data
DROP POLICY IF EXISTS "Users can view their own data" ON users;
CREATE POLICY "Users can view their own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Create a policy that allows users to update their own data
DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Add a policy for service role access (for admin functions)
DROP POLICY IF EXISTS "Service role can access all users" ON users;
CREATE POLICY "Service role can access all users"
ON users
USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable realtime for the users table
alter publication supabase_realtime add table users;
