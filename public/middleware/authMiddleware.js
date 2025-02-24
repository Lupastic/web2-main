const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];


    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }



    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = { userId: decoded.userId };
        next();
    } catch (error) {
        console.error('JWT Verification Error:', error);
        let errorMessage = 'Invalid token';
        if (error instanceof jwt.TokenExpiredError) {
            errorMessage = 'Token has expired';
        } else if (error instanceof jwt.JsonWebTokenError) {
            errorMessage = 'Invalid token signature';
        }
        return res.status(403).json({ error: errorMessage });
    }
};

module.exports = {
    verifyToken
};