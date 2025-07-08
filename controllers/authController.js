const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');

exports.signupDirector = async (req, res) => {
  const { email, password, name, phone, doj, designation, department, director_title, emergency_contact_name, emergency_contact_phone } = req.body;

  // Validate required fields
  const requiredFields = { email, password, name, doj, designation, department, director_title, emergency_contact_name, emergency_contact_phone };
  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value) {
      return res.status(400).json({ error: `Missing required field: ${key}` });
    }
  }

  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return res.status(400).json({ error: error.message });

    const { error: dbError } = await supabase.from('directors').insert({
      id: data.user.id,
      email,
      name,
      phone,
      join_date: doj, // Map doj to join_date as per schema
      designation,
      department,
      role: director_title, // Use director_title as the role
      emergency_contact_name,
      emergency_contact_phone,
    });

    if (dbError) return res.status(400).json({ error: dbError.message });

    const token = jwt.sign({ id: data.user.id, role: director_title }, process.env.JWT_SECRET || 'default-secret');
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Attempt to log in as a director using Supabase Auth
    console.log('Attempting director login for email:', email, 'at', new Date().toISOString());
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email: email.toLowerCase(), password });
    console.log('Auth response:', { authData, authError });

    if (!authError) {
      // Director login successful
      const directorQuery = await supabase.from('directors').select('id, role').eq('id', authData.user.id).single();
      if (directorQuery.error && directorQuery.error.code === 'PGRST116') {
        return res.status(400).json({ error: 'Director role not found' });
      }
      const userData = directorQuery.data;
      const token = jwt.sign({ id: authData.user.id, role: userData.role }, process.env.JWT_SECRET || 'default-secret', { expiresIn: '24h' });
      return res.status(200).json({ token, role: userData.role });
    }

    // If Supabase Auth fails, try employee login
    console.log('Attempting employee login for email:', email);
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('id, email, password, role')
      .eq('email', email.toLowerCase())
      .single();

    if (employeeError && employeeError.code !== 'PGRST116') {
      return res.status(400).json({ error: employeeError.message });
    }
    if (!employeeData || !employeeData.password || employeeData.password !== password) {
      return res.status(400).json({ error: 'Invalid login credentials' });
    }

    // Generate JWT token for employee
    const token = jwt.sign({ id: employeeData.id, role: employeeData.role }, process.env.JWT_SECRET || 'default-secret', { expiresIn: '24h' });
    res.status(200).json({ token, role: employeeData.role });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};