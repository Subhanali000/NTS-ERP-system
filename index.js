require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const managerRoutes = require('./routes/managerRoutes');
const directorRoutes = require('./routes/directorRoutes');
const jwt = require('jsonwebtoken');

const supabase = require('./config/supabase');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Expecting "Bearer <token>"
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = decoded; // Attach decoded token to request object
    next();
  });
};

// Common route to fetch user profile (role and name) from employees or directors table
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    // Assuming Supabase client or PostgreSQL pool (replace with your DB client)
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('name, role')
      .eq('id', userId)
      .single();

    if (employeeError && employeeError.code !== 'PGRST116') { // PGRST116 means no rows found
      throw employeeError;
    }

    let userData = employee;

    if (!userData) {
      const { data: director, error: directorError } = await supabase
        .from('directors')
        .select('name, role')
        .eq('id', userId)
        .single();

      if (directorError && directorError.code !== 'PGRST116') {
        throw directorError;
      }
      userData = director;
    }

    if (!userData) {
      return res.status(404).json({ error: 'User not found in employees or directors table' });
    }

    res.json({ id: userId, name: userData.name, role: userData.role });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/director', directorRoutes);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});