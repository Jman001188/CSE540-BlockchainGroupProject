-- 1. Companies Table (Needed for user registration)
CREATE TABLE IF NOT EXISTS companies (
    company_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    permission_level TEXT DEFAULT 'Basic',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_key TEXT,
    username TEXT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT CHECK (role IN ('farmer', 'processor', 'distributor', 'retailer')),
    company_id UUID REFERENCES companies(company_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Batches Table
CREATE TABLE IF NOT EXISTS batches (
    batch_id TEXT PRIMARY KEY,
    product_name TEXT NOT NULL,
    origin_location TEXT,
    ipfs_hash TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Transfers Table (Needed for the supply chain hand-offs)
CREATE TABLE IF NOT EXISTS transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id TEXT REFERENCES batches(batch_id),
    from_company UUID REFERENCES companies(company_id),
    to_company UUID REFERENCES companies(company_id),
    sender_id UUID REFERENCES users(user_id),
    status TEXT DEFAULT 'pending', -- 'pending' or 'accepted'
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);