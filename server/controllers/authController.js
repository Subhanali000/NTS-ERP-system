const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

// Signup Director
const signupDirector = async (req, res) => {
  const {
    email, password, name, phone, doj, designation, department,
    director_title, emergency_contact_name, emergency_contact_phone
  } = req.body;

  const requiredFields = {
    email, password, name, doj, designation,
    department, director_title, emergency_contact_name, emergency_contact_phone
  };

  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value) return res.status(400).json({ error: `Missing field: ${key}` });
  }

  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return res.status(400).json({ error: error.message });

    const { error: dbError } = await supabase.from('directors').insert({
      id: data.user.id,
      email,
      name,
      phone,
      join_date: doj,
      designation,
      department,
      role: director_title,
      emergency_contact_name,
      emergency_contact_phone,
    });

    if (dbError) return res.status(400).json({ error: dbError.message });

    const token = jwt.sign(
      { id: data.user.id, role: director_title },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );

    return res.status(201).json({ token });

  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Login for all roles
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const normalizedEmail = email.toLowerCase();

  try {
    const { data: authData } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });

    if (authData?.user) {
      const { data: director } = await supabase
        .from('directors')
        .select('id, role')
        .eq('id', authData.user.id)
        .single();

      if (director) {
        const token = jwt.sign(
          { id: director.id, role: director.role },
          process.env.JWT_SECRET || 'default-secret',
          { expiresIn: '24h' }
        );
        return res.status(200).json({ token, role: director.role });
      }
    }

    const { data: employee } = await supabase
      .from('employees')
      .select('id, email, password, role')
      .eq('email', normalizedEmail)
      .single();

    if (employee) {
      if (employee.password !== password) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign(
        { id: employee.id, role: employee.role },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '24h' }
      );
      return res.status(200).json({ token, role: employee.role });
    }

    const { data: manager } = await supabase
      .from('manager')
      .select('id, email, password, role')
      .eq('email', normalizedEmail)
      .single();

    if (manager) {
      if (manager.password !== password) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign(
        { id: manager.id, role: manager.role },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '24h' }
      );
      return res.status(200).json({ token, role: manager.role });
    }

    return res.status(404).json({ error: 'User not found' });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};



const getCurrentUser = async (req, res) => {
  try {
    const { id, role } = req.user;

    let table = null;

    switch (role) {
      case 'director':
        table = 'directors';
        break;
      case 'manager':
        table = 'manager';
        break;
      case 'employee':
      case 'intern': // assuming interns are in the same table as employees
        table = 'employees';
        break;
      default:
        return res.status(400).json({ error: 'Invalid role' });
    }

    const { data: user, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Append role to user object
    user.role = role;

    res.json(user);
  } catch (error) {
    console.error('❌ Error fetching current user:', error.message);
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};
// Add this function at the bottom or alongside your other functions
const getAllUsers = async (req, res) => {
  try {
    const [employeesRes, managersRes, directorsRes] = await Promise.all([
      supabase.from('employees').select('*'),
      supabase.from('manager').select('*'),
      supabase.from('directors').select('*'),
    ]);

    const employees = employeesRes.data || [];
    const managers = managersRes.data || [];
    const directors = directorsRes.data || [];

    const allUsers = [...employees, ...managers, ...directors];

    res.json(allUsers);
  } catch (error) {
    console.error('❌ Error fetching all users:', error.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};
module.exports = {
  signupDirector,
  login,
  getCurrentUser,
  getAllUsers, // <== ✅ Add this line
};

