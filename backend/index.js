const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db'); 
require('dotenv').config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

// --- AUTH & USER REGISTRATION ---
const jwt = require('jsonwebtoken'); 

app.post('/auth/login', async (req, res) => {
    try {
        // Use LEFT JOIN so users without a company can still log in
        const sql = `
            SELECT u.*, c.name as company_name, c.permission_level 
            FROM users u 
            LEFT JOIN companies c ON u.company_id = c.company_id 
            WHERE u.email = $1
        `;
        
        const result = await db.query(sql, [req.body.email]);
        const user = result.rows[0];

        // Check if user exists AND password matches the hash
        if (user && await bcrypt.compare(req.body.password, user.password_hash)) {
            // Generate a token (In production, use a real secret key in your .env)
            const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET || 'super-secret-key', { expiresIn: '2h' });
            
            res.json({
                sessionToken: token,
                user: { 
                    userID: user.user_id, 
                    firstName: user.first_name, 
                    lastName: user.last_name,
                    role: user.role
                },
                company: { 
                    companyID: user.company_id, 
                    companyName: user.company_name, 
                    permission: user.permission_level 
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

// Full Auth Registration (Hashed Password)
app.post('/auth/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const sql = `INSERT INTO users (email, password_hash, company_id, first_name, last_name, role) 
                     VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id`;
        
        const result = await db.query(sql, [
            req.body.email, 
            hashedPassword, 
            req.body.companyId, 
            req.body.firstName, 
            req.body.lastName, 
            req.body.role
        ]);
        
        res.status(201).json({
            userId: result.rows[0].user_id,
            registrationToken: "temp-reg-token-xyz" 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// --- COMPANY & USER MANAGEMENT ---

// --- COMPANY MANAGEMENT ---
app.post('/company', async (req, res) => {
    try {
        const sql = "INSERT INTO companies (name, permission_level) VALUES ($1, $2) RETURNING *";
        const result = await db.query(sql, [req.body.name, req.body.permission_level]);
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

app.patch('/user/:userId', async (req, res) => {
    try {
        const sql = 'UPDATE users SET first_name = $1, last_name = $2 WHERE user_id = $3 RETURNING *';
        const result = await db.query(sql, [req.body.firstName, req.body.lastName, req.params.userId]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Update failed" });
    }
});

// --- TRANSFERS ---

app.post('/transfers/pending', async (req, res) => {
    try {
        const sql = `INSERT INTO transfers (batch_id, from_company, to_company, sender_id, status) 
                     VALUES ($1, $2, $3, $4, 'pending') RETURNING *`;
        const result = await db.query(sql, [
            req.body.batchId, 
            req.body.fromCompany, 
            req.body.toCompany, 
            req.body.senderId
        ]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Transfer creation failed" });
    }
});

app.post('/transfers/:transferId/accept', async (req, res) => {
    try {
        const sql = "UPDATE transfers SET status = 'accepted', completed_at = NOW() WHERE id = $1 RETURNING *";
        const result = await db.query(sql, [req.params.transferId]);
        
        res.json({
            message: "Transfer accepted in DB. Please sign blockchain transaction.",
            data: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Acceptance failed" });
    }
});

// --- SECURITY MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    // Look for the token in the headers
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format is "Bearer <token>"

    if (!token) return res.status(401).json({ error: "Access Denied: No Token Provided" });

    jwt.verify(token, process.env.JWT_SECRET || 'super-secret-key', (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid or Expired Token" });
        req.user = user; // Attach the user ID to the request
        next(); // Let them through!
    });
};

// --- CORE SUPPLY CHAIN APIs ---
app.post('/api/batches', authenticateToken, async (req, res) => {
    try {
        const sql = "INSERT INTO batches (batch_id, product_name, origin_location) VALUES ($1, $2, $3) RETURNING *";
        const result = await db.query(sql, [req.body.batchId, req.body.productName, req.body.originLocation]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create batch" });
    }
});

app.get('/', (req, res) => {
    res.send('The Honest Harvest API is running!');
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});