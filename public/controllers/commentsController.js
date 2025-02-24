const { pool } = require('../db');

const createComment = async (req, res) => {
    try {
        const { comment_text, user_id, topic_id, username } = req.body; 
        const newComment = await pool.query(
            'INSERT INTO comments (comment_text, user_id, topic_id, username) VALUES($1, $2, $3, $4) RETURNING *', 
            [comment_text, user_id, topic_id, username]
        );
        res.status(201).json(newComment.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Ошибка сервера" });
    }
};

const getAllComments = async (req, res) => {
    const topic_id = req.query.topic_id; // Get topic_id from query parameters

    if (!topic_id) {
        return res.status(400).json({ error: "topic_id is required" });
    }

    try {
        const allComments = await pool.query(
            `SELECT comments.*, users.username
             FROM comments
             INNER JOIN users ON comments.user_id = users.user_id
             WHERE topic_id = $1`,
            [topic_id]
        );
        console.log('Fetched comments:', allComments.rows);
        res.json(allComments.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Ошибка сервера" });
    }
};

const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment_text, user_id, topic_id } = req.body;
        const updatedComment = await pool.query(
            'UPDATE comments SET comment_text = $1, user_id = $2, topic_id = $3 WHERE comment_id = $4 RETURNING *',
            [comment_text, user_id, topic_id, id]
        );

        if (updatedComment.rows.length === 0) {
            return res.status(404).json({ error: "Комментарий не найден" });
        }

        res.json(updatedComment.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Ошибка сервера" });
    }
};

const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedComment = await pool.query('DELETE FROM comments WHERE comment_id = $1 RETURNING *', [id]);

        if (deletedComment.rows.length === 0) {
            return res.status(404).json({ error: "Комментарий не найден" });
        }

        res.json({ message: "Комментарий успешно удален" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Ошибка сервера" });
    }
};

module.exports = {
    createComment,
    getAllComments,
    updateComment,
    deleteComment,
};