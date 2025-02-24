const { pool } = require('../db.js');

const createTopic = async (req, res) => {
    try {
        const { title } = req.body;
        const user_id = req.user.userId;
        const user = await pool.query('SELECT username FROM users WHERE user_id = $1', [user_id]);

        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'User not found' }); // Handle the case where user doesn't exist
        }
        const username = user.rows[0].username; // Get the username

        const newTopic = await pool.query(
            'INSERT INTO topics (title, user_id, username) VALUES($1, $2, $3) RETURNING *', // Modified INSERT
            [title, user_id, username]
        );

        res.status(201).json(newTopic.rows[0]);
    } catch (err) {
        console.error('Error during topic creation:', err);
        res.status(500).json({ error: "Server error" });
    }
};
const likeTopic = async (req, res) => {
    const { id } = req.params; // topicId
    const userId = req.user.userId; // Get userId from the token
    console.log(`Liking topic ${id} by user ${userId}`);

    try {
        // 1. Check if the user already liked the topic
        const existingLike = await pool.query(
            'SELECT * FROM topic_likes WHERE topic_id = $1 AND user_id = $2',
            [id, userId]
        );

        if (existingLike.rows.length > 0) {
            // 2a. If already liked, remove the like (unlike)
            await pool.query(
                'DELETE FROM topic_likes WHERE topic_id = $1 AND user_id = $2',
                [id, userId]
            );
            await pool.query(
                'UPDATE topics SET likes_count = likes_count - 1 WHERE topic_id = $1',
                [id]
            );
            console.log(`User ${userId} unliked topic ${id}`);
        } else {
            // 2b. If not liked, add the like
            await pool.query(
                'INSERT INTO topic_likes (topic_id, user_id) VALUES ($1, $2)',
                [id, userId]
            );
            await pool.query(
                'UPDATE topics SET likes_count = likes_count + 1 WHERE topic_id = $1',
                [id]
            );
            console.log(`User ${userId} liked topic ${id}`);
        }

        // 3. Get the updated likes count
        const updatedTopic = await pool.query('SELECT likes_count FROM topics WHERE topic_id = $1', [id]);
        const likes_count = updatedTopic.rows[0].likes_count;

        // 4. Send back the updated likes count in the response
        res.json({ likes_count: likes_count }); // Send back the updated count
    } catch (error) {
        console.error('Error during like/unlike:', error);
        res.status(500).json({ error: "Server error during like/unlike" });
    }
};
const getAllTopics = async (req, res) => {
    try {
        let query = 'SELECT * FROM topics';
        let orderBy = '';

        if (req.query.sort === 'likes') {
            orderBy = ' ORDER BY likes_count DESC';
        }

        const allTopics = await pool.query(query + orderBy);
        res.json(allTopics.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Ошибка сервера" });
    }
};

const getTopicById = async (req, res) => {
    try {
        const { id } = req.params;
        const topic = await pool.query('SELECT * FROM topics WHERE topic_id = $1', [id]);

        if (topic.rows.length === 0) {
            return res.status(404).json({ error: "Тема не найдена" });
        }

        res.json(topic.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Ошибка сервера" });
    }
};

const updateTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
        const userIdFromToken = req.user.userId; // Получаем user_id из токена

        // Получаем тему из базы данных, чтобы проверить user_id
        const topic = await pool.query('SELECT user_id FROM topics WHERE topic_id = $1', [id]);

        if (topic.rows.length === 0) {
            return res.status(404).json({ error: "Тема не найдена" });
        }

        const topicOwnerId = topic.rows[0].user_id;

        // Проверяем, имеет ли пользователь право на изменение темы
        if (userIdFromToken !== topicOwnerId) {
            return res.status(403).json({ error: 'У вас нет прав на изменение этой темы' });
        }

        const updatedTopic = await pool.query(
            'UPDATE topics SET title = $1 WHERE topic_id = $2 RETURNING *',
            [title, id]
        );

        res.json(updatedTopic.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Ошибка сервера" });
    }
};

const deleteTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const userIdFromToken = req.user.userId; 
        const topic = await pool.query('SELECT user_id FROM topics WHERE topic_id = $1', [id]);

        if (topic.rows.length === 0) {
            return res.status(404).json({ error: "Тема не найдена" });
        }

        const topicOwnerId = topic.rows[0].user_id;
        if (userIdFromToken !== topicOwnerId) {
            return res.status(403).json({ error: 'У вас нет прав на удаление этой темы' });
        }

        const deletedTopic = await pool.query('DELETE FROM topics WHERE topic_id = $1 RETURNING *', [id]);

        if (deletedTopic.rows.length === 0) {
            return res.status(404).json({ error: "Тема не найдена" });
        }

        res.json({ message: "Тема успешно удалена" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Ошибка сервера" });
    }
};

module.exports = {
    createTopic,
    getAllTopics,
    getTopicById,
    updateTopic,
    likeTopic,
    deleteTopic,
};
