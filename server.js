require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

// ✅ CORS Middleware
app.use(cors({
    origin: 'http://localhost:8080', // frontend URL
    credentials: true,               // allow cookies, authorization headers
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ JSON Parsing Middleware
app.use(express.json());

// ✅ Mock Database (for testing purposes)
let users = []; // Array to store user records

// ✅ Signup Route
app.post('/api/signup', (req, res) => {
    const { username, email, password } = req.body;

    // Check if user already exists
    if (users.some(u => u.email === email)) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = { id: users.length + 1, username, email, password };
    users.push(user);

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });

    res.status(201).json({
        token,
        user: { username, email }
    });
});

// ✅ Login Route
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Find matching user
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // Generate new JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });

    res.json({
        token,
        user: { username: user.username, email: user.email }
    });
});

// ✅ Token Validation Route
app.get('/api/validate', (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ valid: false, message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ valid: true, userId: decoded.userId });
    } catch {
        res.status(401).json({ valid: false, message: 'Invalid or expired token' });
    }
});

// ✅ Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
