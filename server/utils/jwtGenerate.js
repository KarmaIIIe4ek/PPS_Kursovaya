const jwt = require('jsonwebtoken');

module.exports = function (id, email, role) {
    return jwt.sign(
        { id, email, role },
        process.env.SECRET_KEY,
        { expiresIn: '8h' }
    );
};