// authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer <token>


  if (!token) {
    return res.status(403).json({ message: 'Access denied' });
  }

  jwt.verify(token, 'roboclaim', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user; // Attach the user to the request

    console.log(user);
    
    next();
  });
};

module.exports = authenticateJWT;
