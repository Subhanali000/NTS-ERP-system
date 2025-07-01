
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
      role: director_title,
      emergency_contact_name,
      emergency_contact_phone,
    });

    if (dbError) return res.status(400).json({ error: dbError.message });

    const token = jwt.sign({ id: data.user.id, role: 'director' }, process.env.JWT_SECRET || 'default-secret'); // Fallback secret
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json({ error: error.message });

    let user;
    if (role === 'director') {
      user = await supabase.from('directors').select('role').eq('id', data.user.id).single();
    } else {
      user = await supabase.from('employees').select('role').eq('id', data.user.id).single();
    }

    if (user.error) return res.status(400).json({ error: user.error.message });

    const token = jwt.sign({ id: data.user.id, role: user.data.role }, process.env.JWT_SECRET || 'default-secret'); // Fallback secret
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
