const jwt = require('jsonwebtoken');

// General authentication (token check only)
exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: false, error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // e.g., { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ status: false, error: 'Invalid or expired token.' });
  }
};

// Role-based guard
exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ status: false, error: 'Forbidden. You do not have access to this resource.' });
    }
    next();
  };
};
