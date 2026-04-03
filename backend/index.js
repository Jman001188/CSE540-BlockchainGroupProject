const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 8080;

app.get('/', (req, res) => {
    res.send('The Honest Harvest Backend is running!');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('Server running on http://localhost:8080');
});
