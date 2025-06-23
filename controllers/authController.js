const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');

exports.signupDirector = async (req, res) => {
  const { email, password, name, phone, doj, designation, department, director_title } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) return res.status(400).json({ error: error.message });

  const { error: dbError } = await supabase.from('users').insert({
    id: data.user.id,
    email,
    role: 'director',
    name,
    phone,
    doj,
    designation,
    department,
    director_title,
  });

  if (dbError) return res.status(400).json({ error: dbError.message });

  const token = jwt.sign({ id: data.user.id, role: 'director' }, process.env.JWT_SECRET);
  res.status(201).json({ token });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(400).json({ error: error.message });

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (userError) return res.status(400).json({ error: userError.message });

  const token = jwt.sign({ id: data.user.id, role: userData.role }, process.env.JWT_SECRET);
  res.status(200).json({ token });
};