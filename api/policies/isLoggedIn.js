const jwt = require('jsonwebtoken');

module.exports = async function (req, res, next) {
  const JWT_SECRET = process.env.JWT_SECRET || 'secret';
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.badRequest({
      message: 'Customer not logged in',
    });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.badRequest({
      message: 'Invalid or expired token',
    });
  }
};
