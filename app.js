const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const userRoutes = require('./public/routes/users');
const topicRoutes = require('./public/routes/topics');
const commentRoutes = require('./public/routes/comments');
const { pool } = require('./public/db');
require('dotenv').config({path: path.join(__dirname,'./public/db.env')})
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// Routes
app.use('/api/users', userRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/comments', commentRoutes);
// Переходы на страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/main', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'main.html'));
});
app.get('/sign', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sign.html'));
});
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});