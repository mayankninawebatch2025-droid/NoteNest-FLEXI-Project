const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'notenest_production_ready_jwt_super_secret_key_2026_flexi',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const verifyToken = (token) => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET || 'notenest_production_ready_jwt_super_secret_key_2026_flexi'
  );
};

module.exports = {
  generateToken,
  verifyToken,
};

