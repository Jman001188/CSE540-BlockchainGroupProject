CREATE TABLE IF NOT EXISTS users (
    public_key TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    role TEXT CHECK (role IN ('farmer', 'processor', 'distributor', 'retailer')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS batches (
    batch_id TEXT PRIMARY KEY, -- This matches the ID on the Blockchain
    product_name TEXT NOT NULL,
    origin_location TEXT,
    ipfs_hash TEXT,             -- Link to certificates or photos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);