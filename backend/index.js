const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); 
const jwt = require('jsonwebtoken'); 
const db = require('./db'); 
const fs = require('fs');
require('dotenv').config();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const app = express();
app.use(cors());
app.use(express.json());
const { ethers } = require('ethers');

try {
    const isDocker = process.env.DOCKER_ENV === 'true';
    
    // We only read the address file now, NOT the corrupted ABI file
    const deployPath = isDocker 
        ? '/deployments/deployed-address.json' 
        : '../blockchain/honest_harvest_hardhat_files/deployments/deployed-address.json';

    const deployedData = require(deployPath);
    contractAddress = deployedData.address;

    contractABI = [
        "function registerItem(bytes32 dataHash) external returns (uint256)",
        "function transferOwnership(uint256 itemID, address newOwner) external",
        "function updateItemDataHash(uint256 itemID, bytes32 newDataHash) external"
    ];
    
    console.log(`✅ Smart Contract loaded! Environment: ${isDocker ? 'Docker' : 'Local'}`);
    console.log(`   Contract Address: ${contractAddress}`);
} catch (err) {
    console.warn("⚠️ Warning: Smart contract files not found.");
}

// Log a message on every connection
app.use((req, res, next) => {
    console.log(`${req.method}: ${req.url}`);
    next();
});

// --- SECURITY MIDDLEWARE ---

const authenticateToken = (req, res, next) => {
    let token = req.body?.sessionToken;
    if (!token) {
        const authHeader = req.headers['authorization'];
        token = authHeader && authHeader.split(' ')[1];
    }

    if (!token) return res.status(401).json({ error: "Access Denied: No Token Provided" });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: "Invalid or Expired Token" });
        req.user = decoded; // Contains userId, companyId, role
        next();
    });
};

// Middleware to restrict routes to managers only
const requireManager = (req, res, next) => {
    if (req.user.role !== 'manager') {
        return res.status(403).json({ error: "Access Denied: Requires Manager Role" });
    }
    next();
};

// --- 1. USERS & AUTHENTICATION ---

// Create Registration Token (Managers Only)
app.post('/auth/registration-tokens', authenticateToken, requireManager, async (req, res) => {
    try {
        const { userEmail, role } = req.body;
        console.log(userEmail)
        console.log(role)
        const companyId = req.user.companyId;
        const secureToken = crypto.randomBytes(32).toString('hex');

        const sql = `INSERT INTO registration_tokens (token, email, company_id, role, created_by) 
                     VALUES ($1, $2, $3, $4, $5) RETURNING registration_token_id, token`;
        const result = await db.query(sql, [secureToken, userEmail, companyId, role, req.user.userId]);
        
        res.status(201).json({
            registrationTokenId: result.rows[0].registration_token_id,
            registrationToken: result.rows[0].token
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create registration token" });
    }
});

// Revoke Registration Token (Managers Only)
app.post('/auth/registration-tokens/:id/revoke', authenticateToken, requireManager, async (req, res) => {
    try {
        const sql = `UPDATE registration_tokens SET status = 'revoked' 
                     WHERE registration_token_id = $1 AND company_id = $2 RETURNING registration_token_id, status`;
        const result = await db.query(sql, [req.params.id, req.user.companyId]);
        
        if (result.rowCount === 0) return res.status(404).json({ error: "Token not found or unauthorized" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to revoke token" });
    }
});

// Get Registration Token List (Managers Only)
app.get('/auth/registration-tokens/token-list', authenticateToken, requireManager, async (req, res) => {
    try {
        const sql = `
            SELECT rt.*, c.name as company_name, u.first_name || ' ' || u.last_name as created_by_name
            FROM registration_tokens rt 
            JOIN companies c ON rt.company_id = c.company_id 
            LEFT JOIN users u ON rt.created_by = u.user_id
            WHERE rt.company_id = $1`;
        const result = await db.query(sql, [req.user.companyId]);
        
        const formatted = result.rows.map(rt => ({
            tokenId: rt.registration_token_id,
            registrationToken: rt.token,
            email: rt.email,
            companyId: rt.company_id,
            companyName: rt.company_name,
            role: rt.role,
            status: rt.status,
            createdAt: rt.created_at,
            createdById: rt.created_by,
            createdByName: rt.created_by_name
        }));
        res.json(formatted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch tokens" });
    }
});

// Get Registration Token Info (Public - for pre-filling signup form)
app.post('/auth/registration-tokens/token', async (req, res) => {
    try {
        const sql = `
            SELECT rt.registration_token_id as "tokenId", rt.token as "registrationToken", 
                   rt.email, rt.company_id as "companyId", c.name as "companyName", 
                   rt.role, rt.status, rt.created_at as "createdAt", 
                   rt.created_by as "createdById", u.first_name || ' ' || u.last_name as "createdByName"
            FROM registration_tokens rt 
            JOIN companies c ON rt.company_id = c.company_id 
            LEFT JOIN users u ON rt.created_by = u.user_id
            WHERE rt.token = $1 AND rt.status = 'pending'`;
        const result = await db.query(sql, [req.body.registrationToken]);
        
        if (result.rowCount === 0) return res.status(404).json({ error: "Invalid or expired token" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch token info" });
    }
});

// Register User (Consumes token)
app.post('/auth/register', async (req, res) => {
    const client = await db.connect(); // Use transaction to ensure token and user update together
    try {
        await client.query('BEGIN');
        const { registrationToken, password, firstName, lastName } = req.body;

        // 1. Verify token
        const tokenQuery = await client.query(
            "SELECT * FROM registration_tokens WHERE token = $1 AND status = 'pending' FOR UPDATE", 
            [registrationToken]
        );
        
        if (tokenQuery.rowCount === 0) throw new Error("Invalid or expired token");
        const tokenData = tokenQuery.rows[0];

        // 2. Create User
        const hashedPassword = await bcrypt.hash(password, 10);
        const userSql = `INSERT INTO users (email, password_hash, first_name, last_name, role, company_id) 
                         VALUES ($1, $2, $3, $4, $5, $6)`;
        await client.query(userSql, [tokenData.email, hashedPassword, firstName, lastName, tokenData.role, tokenData.company_id]);

        // 3. Mark Token as Used
        await client.query("UPDATE registration_tokens SET status = 'used', used_at = NOW() WHERE token = $1", [registrationToken]);

        await client.query('COMMIT');
        res.status(201).json({ message: "Registration successful." });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(400).json({ error: err.message || "Registration failed" });
    } finally {
        client.release();
    }
});

// User Login
app.post('/auth/login', async (req, res) => {
    try {        
        const sql = `
            SELECT u.*, c.name as company_name, c.wallet_address 
            FROM users u 
            JOIN companies c ON u.company_id = c.company_id 
            WHERE LOWER(u.email) = LOWER($1)`; 
        
        const result = await db.query(sql, [req.body.email]);
        const user = result.rows[0];

        if (user && await bcrypt.compare(req.body.password, user.password_hash)) {
            const token = jwt.sign(
                { userId: user.user_id, companyId: user.company_id, role: user.role }, 
                JWT_SECRET, 
                { expiresIn: '24h' }
            );
            console.log("Login Successful!")
            res.json({
                sessionToken: token,
                expiresIn: "24 hours", // 86400 - 24 hours in seconds
                user: { 
                    userId: user.user_id, 
                    firstName: user.first_name, 
                    lastName: user.last_name,
                    email: user.email,
                    role: user.role
                },
                company: { 
                    companyId: user.company_id, 
                    companyName: user.company_name,
                    walletAddress: user.wallet_address
                }
            });
        } else {
            console.log("Login Failed: Invalid Email or Password.")
            res.status(401).json({ error: "Invalid email or password" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Login failed" });
    }
});

// User Logout
app.post('/auth/logout', authenticateToken, (req, res) => {
    res.json({ message: "Logged out successfully" });
});

// Update User Profile
app.patch('/users/:userId', authenticateToken, async (req, res) => {
    try {
        // Ensure users can only update their own profile
        if (req.user.userId !== req.params.userId) {
            return res.status(403).json({ error: "Unauthorized to edit this user" });
        }

        const sql = `UPDATE users SET first_name = $1, last_name = $2 WHERE user_id = $3 RETURNING *`;
        const result = await db.query(sql, [req.body.firstName, req.body.lastName, req.params.userId]);
        
        res.json({
            user: {
                userId: result.rows[0].user_id,
                firstName: result.rows[0].first_name,
                lastName: result.rows[0].last_name,
                role: result.rows[0].role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Profile update failed" });
    }
});

// --- 3. CORE SUPPLY CHAIN & TRANSFERS ---

// Register a New Batch
app.post('/batches', authenticateToken, async (req, res) => {
    try {
        const sql = `INSERT INTO batches (batch_name, batch_description, company_id, created_by, blockchain_status) 
                     VALUES ($1, $2, $3, $4, 'pending') RETURNING *`;
        const result = await db.query(sql, [
            req.body.batchName, 
            req.body.batchDescription,
            req.user.companyId, 
            req.user.userId
        ]);
        
        const batch = result.rows[0];

        // Create batch lineage and store in DB
        for (const derivedBatchId of req.body.derivedBatchIds) {
            const lineageSql = `INSERT INTO batch_lineage (new_batch_id, source_batch_id) VALUES ($1, $2) RETURNING *`;
            await db.query(lineageSql, [
                batch.batch_id, 
                derivedBatchId, 
            ]);
        }

        const dataToHash = {
            batchId: batch.batch_id,
            batchName: batch.batch_name,
            batchDescription: batch.batch_description,
            derivedBatches: req.body.derivedBatchIds,
            companyId: batch.company_id,
            createdAt: batch.created_at
        };
        const dataHash = crypto.createHash('sha256').update(JSON.stringify(dataToHash)).digest('hex');

        // Store Hashed data in DB
        const updateBatchSql = `UPDATE batches SET data_hash = $1 WHERE batch_id = $2`;
        await db.query(updateBatchSql, [dataHash, batch.batch_id]);

        // Setup Ethers connection
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const wallet = new ethers.Wallet(process.env.COMPANY_PRIVATE_KEY, provider);
        const contract = new ethers.Contract(contractAddress, contractABI, wallet);

        // 1. Ethers needs bytes32 to start with "0x"
        const bytes32Hash = "0x" + dataHash;
        
        console.log(`Sending to blockchain: Hash: ${bytes32Hash}`);
        
        // 2. Pass the hash, because the contract makes its own ID!
        const tx = await contract.registerItem(bytes32Hash);
        const receipt = await tx.wait();

        // Update Database with Final Blockchain Data
        const finalUpdateSql = `UPDATE batches 
                                SET blockchain_status = 'confirmed', blockchain_tx_id = $1 
                                WHERE batch_id = $2 RETURNING *`;
        const finalResult = await db.query(finalUpdateSql, [receipt.hash, batch.batch_id]);
        const finalBatch = finalResult.rows[0];

        res.status(201).json({
            batchId: finalBatch.batch_id,
            batchName: finalBatch.batch_name,
            batchDescription: finalBatch.batch_description,
            createdAt: finalBatch.created_at,
            blockchain: {
                transactionId: finalBatch.blockchain_tx_id,
                status: finalBatch.blockchain_status,
                dataHash: finalBatch.data_hash
            }
        });

    } catch (err) {
        console.error("Batch Creation Failed:", err);
        res.status(500).json({ error: err.message || "Failed to fully register batch." });
    }
});

// Get Batch List
app.get('/batches', authenticateToken, async (req, res) => {
    try {
        const sql = `
            SELECT b.*, c.name as registering_company_name, u.first_name || ' ' || u.last_name as registering_user_name 
            FROM batches b
            JOIN companies c ON b.company_id = c.company_id
            JOIN users u ON b.created_by = u.user_id
            WHERE b.company_id = $1`;
        const result = await db.query(sql, [req.user.companyId]);
        
        const formatted = result.rows.map(b => ({
            batchId: b.batch_id,
            batchName: b.batch_name,
            batchDescription: b.batch_description,
            createdAt: b.created_at,
            registeringCompanyId: b.company_id,
            registeringCompanyName: b.registering_company_name,
            registeringUserId: b.created_by,
            registeringUserName: b.registering_user_name,
            blockchain: {
                transactionId: b.blockchain_tx_id,
                status: b.blockchain_status,
                dataHash: b.data_hash
            }
        }));
        res.json(formatted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch batches" });
    }
});

// Get Batch Details (Public view of the batch)
app.get('/batches/:batchId', async (req, res) => {
    try {
        const sql = `
            SELECT b.*, c.name as registering_company_name, u.first_name || ' ' || u.last_name as registering_user_name 
            FROM batches b
            JOIN companies c ON b.company_id = c.company_id
            JOIN users u ON b.created_by = u.user_id
            WHERE b.batch_id = $1`;
            
        const result = await db.query(sql, [req.params.batchId]);
        if (result.rowCount === 0) return res.status(404).json({ error: "Batch not found" });
        
        const b = result.rows[0];
        res.json({
            batchId: b.batch_id,
            batchName: b.batch_name,
            batchDescription: b.batch_description,
            createdAt: b.created_at,
            registeringCompanyId: b.company_id,
            registeringCompanyName: b.registering_company_name,
            registeringUserId: b.created_by,
            registeringUserName: b.registering_user_name,
            blockchain: {
                transactionId: b.blockchain_tx_id,
                status: b.blockchain_status,
                dataHash: b.data_hash
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch batch details" });
    }
});

// Initiate Transfer
app.post('/transfers', authenticateToken, async (req, res) => {
    try {
        // SECURITY CHECK: Ensure the sender's company actually owns this batch!
        const batchQuery = await db.query("SELECT company_id FROM batches WHERE batch_id = $1", [req.body.batchId]);
        if (batchQuery.rowCount === 0 || batchQuery.rows[0].company_id !== req.user.companyId) {
            return res.status(403).json({ error: "Unauthorized: Your company does not own this batch." });
        }

        const sql = `INSERT INTO transfers (batch_id, from_company_id, to_company_id, sender_user_id, receiving_user_id, status) 
                     VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`;
        const result = await db.query(sql, [
            req.body.batchId, 
            req.user.companyId, 
            req.body.toCompanyId, 
            req.user.userId,
            req.body.receivingUserId
        ]);
        
        const t = result.rows[0];

        // Hash compelte data
        const dataToHash = {
            transferId: t.transfer_id,
            batchId: t.batch_id,
            fromCompanyId: t.from_company_id,
            toCompanyId: t.to_company_id,
            createdAt: t.created_at
        }
        const dataHash = crypto.createHash('sha256').update(JSON.stringify(dataToHash)).digest('hex');

        // Store Hashed data in DB
        const updateTransferSql = `UPDATE transfers SET data_hash = $1 WHERE transfer_id = $2`;
        await db.query(updateTransferSql, [dataHash, t.transfer_id]);

        // TODO:
        // Call smart contract to initiate transfer.
        // subscribe to blockchain event to update blockchain status once it's accepted on the chain

        res.status(201).json({
            transferId: t.transfer_id,
            batchId: t.batch_id,
            fromCompanyId: t.from_company_id,
            toCompanyId: t.to_company_id,
            senderUserId: t.sender_user_id,
            receivingUserId: t.receiving_user_id,
            createdAt: t.created_at,
            status: t.status
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Transfer creation failed" });
    }
});

// Get Transfer List
app.get('/transfers', authenticateToken, async (req, res) => {
    try {
        const sql = `
            SELECT 
                t.*,
                b.batch_name,
                c1.name as from_company_name,
                c2.name as to_company_name,
                u1.first_name || ' ' || u1.last_name as sender_user_name,
                u2.first_name || ' ' || u2.last_name as receiving_user_name
            FROM transfers t
            JOIN batches b ON t.batch_id = b.batch_id
            JOIN companies c1 ON t.from_company_id = c1.company_id
            JOIN companies c2 ON t.to_company_id = c2.company_id
            JOIN users u1 ON t.sender_user_id = u1.user_id
            LEFT JOIN users u2 ON t.receiving_user_id = u2.user_id
            WHERE t.from_company_id = $1 OR t.to_company_id = $1`;
            
        const result = await db.query(sql, [req.user.companyId]);
        
        const formatted = result.rows.map(t => ({
            transferId: t.transfer_id,
            batchId: t.batch_id,
            batchName: t.batch_name,
            fromCompanyId: t.from_company_id,
            fromCompanyName: t.from_company_name,
            toCompanyId: t.to_company_id,
            toCompanyName: t.to_company_name,
            senderUserId: t.sender_user_id,
            senderUserName: t.sender_user_name,
            receivingUserId: t.receiving_user_id,
            receivingUserName: t.receiving_user_name,
            status: t.status,
            createdAt: t.created_at
        }));
        res.json(formatted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch transfers" });
    }
});

// Complete Transfer
app.post('/transfers/:transferId/complete', authenticateToken, async (req, res) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // Verify transfer belongs to the receiving company
        const tQuery = await client.query("SELECT * FROM transfers WHERE transfer_id = $1 FOR UPDATE", [req.params.transferId]);
        if (tQuery.rowCount === 0 || tQuery.rows[0].to_company_id !== req.user.companyId) {
            throw new Error("Unauthorized or invalid transfer");
        }

        // Update Transfer
        const updateTransferSql = "UPDATE transfers SET status = 'completed', completed_at = NOW() WHERE transfer_id = $1";
        await client.query(updateTransferSql, [req.params.transferId]);

        // Update Batch Ownership
        const updateBatchSql = "UPDATE batches SET company_id = $1 WHERE batch_id = $2";
        await client.query(updateBatchSql, [req.user.companyId, tQuery.rows[0].batch_id]);

        await client.query('COMMIT');
        res.json({ message: "Accepted Transfer." });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: err.message || "Acceptance failed" });
    } finally {
        client.release();
    }
});

// Reject Transfer
app.post('/transfers/:transferId/reject', authenticateToken, async (req, res) => {
    try {
        const sql = "UPDATE transfers SET status = 'rejected' WHERE transfer_id = $1 AND to_company_id = $2 RETURNING *";
        const result = await db.query(sql, [req.params.transferId, req.user.companyId]);
        
        if (result.rowCount === 0) return res.status(403).json({ error: "Unauthorized or transfer not found" });
        
        res.json({ message: "Rejected Transfer." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Rejection failed" });
    }
});

// --- SYSTEM ---

app.post('/company', async (req, res) => {
    try {
        const { name } = req.body;

        const randomWallet = ethers.Wallet.createRandom();
        const generatedWalletAddress = randomWallet.address;
        const privateKey = randomWallet.privateKey; 
        
        const sql = "INSERT INTO companies (name, wallet_address) VALUES ($1, $2) RETURNING *";
        const result = await db.query(sql, [name, generatedWalletAddress]);
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create company" });
    }
});

app.get('/company/:companyId', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM companies WHERE company_id = $1', [req.params.companyId]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Fetch error" });
    }
});

// Get All Companies
app.get('/companies', async (req, res) => {
    try {
        const sql = "SELECT * FROM companies ORDER BY created_at DESC";
        const result = await db.query(sql);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch companies" });
    }
});

// Super Admin: Create Manager Token for a Company (Utility)
app.post('/auth/admin/manager-token', async (req, res) => {
    try {
        const { companyId, userEmail } = req.body;
        const secureToken = crypto.randomBytes(32).toString('hex');

        const sql = `INSERT INTO registration_tokens (token, email, company_id, role, status) 
                     VALUES ($1, $2, $3, 'manager', 'pending') RETURNING registration_token_id, token`;
        const result = await db.query(sql, [secureToken, userEmail, companyId]);
        
        res.status(201).json({
            registrationTokenId: result.rows[0].registration_token_id,
            registrationToken: result.rows[0].token
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create super admin token" });
    }
});

app.get('/', (req, res) => {
    res.send('The Honest Harvest API is running!');
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});