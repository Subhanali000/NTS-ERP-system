
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

exports.verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Fetch role from the appropriate table based on user type
    let userQuery;
    userQuery = await supabase.from('directors').select('role').eq('id', decoded.id).single();
    if (userQuery.error && userQuery.error.code === 'PGRST116') { // Row not found
      userQuery = await supabase.from('employees').select('role').eq('id', decoded.id).single();
    }
    if (userQuery.error) return res.status(401).json({ error: 'Invalid user' });

    req.user.role = userQuery.data.role; // Update role from database
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};
