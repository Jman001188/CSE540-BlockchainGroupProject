const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // Used for generating secure registration tokens
const jwt = require('jsonwebtoken'); 
const db = require('./db'); 
require('dotenv').config();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const app = express();
app.use(cors());
app.use(express.json());

// --- SECURITY MIDDLEWARE ---

// Middleware to authenticate and parse the JWT
const authenticateToken = (req, res, next) => {
    // API docs mention token in body OR headers. We will check body first, then fallback to header.
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
        const companyId = req.user.companyId; // Force token to match manager's company
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
app.get('/auth/registration-tokens', authenticateToken, requireManager, async (req, res) => {
    try {
        const sql = `
            SELECT rt.*, c.name as company_name 
            FROM registration_tokens rt 
            JOIN companies c ON rt.company_id = c.company_id 
            WHERE rt.company_id = $1`;
        const result = await db.query(sql, [req.user.companyId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch tokens" });
    }
});

// Get Registration Token Info (Public - for pre-filling signup form)
app.get('/auth/registration-tokens/:token', async (req, res) => {
    try {
        const sql = `
            SELECT rt.email, rt.company_id, c.name as company_name, rt.role 
            FROM registration_tokens rt 
            JOIN companies c ON rt.company_id = c.company_id 
            WHERE rt.token = $1 AND rt.status = 'pending'`;
        const result = await db.query(sql, [req.params.token]);
        
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
            SELECT u.*, c.name as company_name 
            FROM users u 
            JOIN companies c ON u.company_id = c.company_id 
            WHERE u.email = $1`;
        
        const result = await db.query(sql, [req.body.email]);
        const user = result.rows[0];

        if (user && await bcrypt.compare(req.body.password, user.password_hash)) {
            const token = jwt.sign(
                { userId: user.user_id, companyId: user.company_id, role: user.role }, 
                JWT_SECRET, 
                { expiresIn: '24h' }
            );
            
            res.json({
                sessionToken: token,
                user: { 
                    userId: user.user_id, 
                    firstName: user.first_name, 
                    lastName: user.last_name,
                    email: user.email,
                    role: user.role
                },
                company: { 
                    companyId: user.company_id, 
                    companyName: user.company_name 
                }
            });
        } else {
            res.status(401).json({ error: "Invalid email or password" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Login failed" });
    }
});

// User Logout
app.post('/auth/logout', authenticateToken, (req, res) => {
    // In a stateless JWT system, the client deletes the token. 
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
        res.status(201).json({
            batchId: batch.batch_id,
            batchName: batch.batch_name,
            batchDescription: batch.batch_description,
            blockchain: {
                transactionId: batch.blockchain_tx_id,
                status: batch.blockchain_status
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create batch" });
    }
});

// Get Batch List
app.get('/batches', authenticateToken, async (req, res) => {
    try {
        const sql = `
            SELECT b.*, c.name as registering_company_name, u.first_name as registering_user_name 
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
        const sql = `SELECT * FROM batches WHERE batch_id = $1`;
        const result = await db.query(sql, [req.params.batchId]);
        if (result.rowCount === 0) return res.status(404).json({ error: "Batch not found" });
        
        const b = result.rows[0];
        res.json({
            batchId: b.batch_id,
            batchName: b.batch_name,
            batchDescription: b.batch_description,
            createdAt: b.created_at,
            registeringCompanyId: b.company_id,
            registeringUserId: b.created_by,
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
        const sql = `INSERT INTO transfers (batch_id, from_company_id, to_company_id, sender_user_id, receiving_user_id, status) 
                     VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`;
        const result = await db.query(sql, [
            req.body.batchId, 
            req.user.companyId, 
            req.body.toCompanyId, 
            req.user.userId,
            req.body.receivingUserID
        ]);
        
        const t = result.rows[0];
        res.status(201).json({
            transferId: t.transfer_id,
            batchId: t.batch_id,
            fromCompanyId: t.from_company_id,
            toCompanyId: t.to_company_id,
            senderUserID: t.sender_user_id,
            receivingUserID: t.receiving_user_id,
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
        const sql = `SELECT * FROM transfers WHERE from_company_id = $1 OR to_company_id = $1`;
        const result = await db.query(sql, [req.user.companyId]);
        
        const formatted = result.rows.map(t => ({
            transferId: t.transfer_id,
            batchId: t.batch_id,
            fromCompanyId: t.from_company_id,
            toCompanyId: t.to_company_id,
            senderUserId: t.sender_user_id,
            receivingUserId: t.receiving_user_id,
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

// Create initial company (Utility route for testing, since registration requires a company)
app.post('/company', async (req, res) => {
    try {
        const sql = "INSERT INTO companies (name) VALUES ($1) RETURNING *";
        const result = await db.query(sql, [req.body.name]);
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

app.get('/', (req, res) => {
    res.send('The Honest Harvest API is running!');
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});