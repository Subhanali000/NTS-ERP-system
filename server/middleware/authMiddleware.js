// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer '))
      return res.status(401).json({ error: 'Authorization token missing or malformed' });

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'default-secret';
    const decoded = jwt.verify(token, secret);

    const { data: director } = await supabase
      .from('directors')
      .select('id, role')
      .eq('id', decoded.id)
      .single();

    let user = director;

    if (!user) {
      const { data: employee } = await supabase
        .from('employees')
        .select('id, role')
        .eq('id', decoded.id)
        .single();
      user = employee;
    }

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      id: decoded.id,
      role: user.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

// ✅ Export both functions
module.exports = {
  verifyToken,
  restrictTo,
};
