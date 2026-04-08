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

// Basic User Registration 
app.post('/api/users/register', async (req, res) => {
    try {
        const sql = 'INSERT INTO users (public_key, username, role) VALUES ($1, $2, $3) RETURNING *';
        const result = await db.query(sql, [req.body.public_key, req.body.username, req.body.role]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database Error' });
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

app.get('/', (req, res) => {
    res.send('The Honest Harvest API is running!');
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});