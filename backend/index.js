const db = require('./db');

app.post('/api/users/register', async (req, res) => {
    const { public_key, username, role } = req.body;
    
    try {
        const sql = 'INSERT INTO users (public_key, username, role) VALUES ($1, $2, $3) RETURNING *';
        const values = [public_key, username, role];
        
        const result = await db.query(sql, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database Error');
    }
});