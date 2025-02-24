    const { pool } = require('../db');
    const bcrypt = require('bcrypt');
    const jwt = require('jsonwebtoken');
    const getTopUsersWithTopicCounts = async (req, res) => {
        try {
            const query = `
                SELECT 
                    u.user_id,
                    u.username,
                    COUNT(t.topic_id) AS posts_count  // Используйте alias 'posts_count'
                FROM users u
                LEFT JOIN topics t ON u.user_id = t.user_id
                GROUP BY u.user_id, u.username
                ORDER BY posts_count DESC;  // Сортировка по убыванию количества тем
            `;

            const result = await pool.query(query);
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching top users with topic counts:', error);
            res.status(500).json({ error: 'Server error' });
        }
    };

    const createUser = async (req, res) => {
        const { username, email, password, deviceId } = req.body;

        if (!deviceId) {
            return res.status(400).json({ error: 'Device ID is required for registration' });
        }

        try {
            const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

            if (existingUser.rows.length > 0) {
                return res.status(400).json({ error: 'Email is already registered' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await pool.query(
                'INSERT INTO users (username, email, password) VALUES($1, $2, $3) RETURNING user_id, username, email', // Return relevant data
                [username, email, hashedPassword]
            );

            res.status(201).json(newUser.rows[0]);
        } catch (err) {
            console.error('Error during user creation:', err);
            res.status(500).json({ error: 'Server error: ' + err.message });
        }
    };

    const getAllUsers = async (req, res) => {
        try {
            const allUsers = await pool.query('SELECT user_id, username, email FROM users');
            res.json(allUsers.rows);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: "Server error" });
        }
    };

    const getUserById = async (req, res) => {
        try {
            const { id } = req.params;
            const user = await pool.query('SELECT user_id, username, email FROM users WHERE user_id = $1', [id]);

            if (user.rows.length === 0) {
                return res.status(404).json({ error: "User not found" });
            }

            res.json(user.rows[0]);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: "Server error" });
        }
    };

    const updateUser = async (req, res) => {
        try {
            const { id } = req.params;
            const { username, email, password } = req.body;

            let hashedPassword = null;
            if (password) {
                hashedPassword = await bcrypt.hash(password, 10);
            }

            let query = 'UPDATE users SET username = $1, email = $2';
            const values = [username, email];

            if (hashedPassword) {
                query += ', password = $3';
                values.push(hashedPassword);
            }

            query += ' WHERE user_id = $4 RETURNING user_id, username, email'; // Return relevant data
            values.push(id);

            const updatedUser = await pool.query(query, values);

            if (updatedUser.rows.length === 0) {
                return res.status(404).json({ error: "User not found" });
            }

            res.json(updatedUser.rows[0]);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: "Server error" });
        }
    };

    const deleteUser = async (req, res) => {
        try {
            const { id } = req.params;
            const deletedUser = await pool.query('DELETE FROM users WHERE user_id = $1 RETURNING user_id, username, email', [id]);

            if (deletedUser.rows.length === 0) {
                return res.status(404).json({ error: "User not found" });
            }

            res.json({ message: "User successfully deleted" });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ error: "Server error" });
        }
    };

    const loginUser = async (req, res) => {
        const { email, password } = req.body;

        console.log("Login attempt for email:", email);

        try {
            console.log("Fetching user from database...");
            const user = await pool.query('SELECT user_id, username, password FROM users WHERE email = $1', [email]);
            console.log("User query result:", user.rows);

            if (user.rows.length === 0) {
                console.log("User not found for email:", email);
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const validPassword = await bcrypt.compare(password, user.rows[0].password);
            console.log("Password comparison result:", validPassword);

            if (!validPassword) {
                console.log("Invalid password for email:", email);
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const userId = user.rows[0].user_id;

            const token = jwt.sign({ userId: userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
            res.json({ token: token, userId: userId });

        } catch (err) {
            console.error('Error during login:', err);
            res.status(500).json({ error: 'Server error' });
        }
    };

        const logoutUser = async (req, res) => {
            const authHeader = req.headers['authorization'];
            const deviceId = req.headers['device-id'];

            if (!authHeader || !deviceId) {
                return res.status(400).json({ error: "Authorization header and device ID are required." });
            }

            const token = authHeader.split(' ')[1];  // Extract token
            const userId = req.user.userId;  // You'll need to implement middleware for this (see note below)

            try {
                await pool.query(
                    'DELETE FROM tokens WHERE user_id = $1 AND device_id = $2 AND token = $3',
                    [userId, deviceId, token]
                );
                res.status(200).send({ message: "Logged out successfully!" });
            } catch (err) {
                console.error(err.message);
                res.status(500).json({ error: 'Server error' });
            }
        };

        module.exports = {
            createUser,
            getAllUsers,
            getUserById,
            updateUser,
            deleteUser,
            loginUser,
            logoutUser
        };