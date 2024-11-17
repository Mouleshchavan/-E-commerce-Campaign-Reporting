const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // Get the Authorization header
  const authHeader = req.headers['authorization'];
  
  // If the header is missing or does not include the Bearer token
  if (!authHeader) return res.status(401).json({ error: 'Access Denied' });

  // Split the header to get the token
  const token = authHeader && authHeader.split(' ')[1]; // Split 'Bearer <token>'

  if (!token) return res.status(401).json({ error: 'Access Denied' });

  // Verify the token
  jwt.verify(token, 'JWT_SECRET', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid Token' });
    
    // Attach the user data to the request object
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
