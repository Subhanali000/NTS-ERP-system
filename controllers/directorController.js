const supabase = require('../config/supabase');

exports.registerEmployee = async (req, res) => {
  const { email, name, phone, doj, designation, department, manager_id } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'defaultPassword123', // Generate or send temporary password
  });

  if (error) return res.status(400).json({ error: error.message });

  const { error: dbError } = await supabase.from('users').insert({
    id: data.user.id,
    email,
    role: 'employee',
    name,
    phone,
    doj,
    designation,
    department,
    manager_id,
    director_id: req.user.id,
  });

  if (dbError) return res.status(400).json({ error: dbError.message });

  res.status(201).json({ message: 'Employee registered successfully' });
};

exports.registerIntern = async (req, res) => {
  const { email, name, college, start_date, end_date, manager_id } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'defaultPassword123',
  });

  if (error) return res.status(400).json({ error: error.message });

  const { error: dbError } = await supabase.from('users').insert({
    id: data.user.id,
    email,
    role: 'intern',
    name,
    college,
    internship_start_date: start_date,
    internship_end_date: end_date,
    manager_id,
    director_id: req.user.id,
  });

  if (dbError) return res.status(400).json({ error: dbError.message });

  res.status(201).json({ message: 'Intern registered successfully' });
};

exports.registerManager = async (req, res) => {
  const { email, name, phone, doj, designation, department, manager_title } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'defaultPassword123',
  });

  if (error) return res.status(400).json({ error: error.message });

  const { error: dbError } = await supabase.from('users').insert({
    id: data.user.id,
    email,
    role: 'manager',
    name,
    phone,
    doj,
    designation,
    department,
    manager_title,
    director_id: req.user.id,
  });

  if (dbError) return res.status(400).json({ error: dbError.message });

  res.status(201).json({ message: 'Manager registered successfully' });
};

exports.approveLeave = async (req, res) => {
  const { leave_id, status } = req.body;

  const { error } = await supabase
    .from('leave_requests')
    .update({ director_approval: status })
    .eq('id', leave_id);

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json({ message: 'Leave request updated' });
};

exports.viewDivisionData = async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('director_id', req.user.id);

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json(data);
};

exports.getAllEmployees = async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('director_id', req.user.id)
    .eq('role', 'employee');

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json(data);
};

exports.getAllInterns = async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('director_id', req.user.id)
    .eq('role', 'intern');

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json(data);
};

exports.getAllManagers = async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('director_id', req.user.id)
    .eq('role', 'manager');

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json(data);
};

exports.deleteUser = async (req, res) => {
  const { user_id } = req.params;

  // Ensure the user is under the director
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('director_id')
    .eq('id', user_id)
    .single();

  if (userError || !user || user.director_id !== req.user.id) {
    return res.status(403).json({ error: 'User not found or not under your division' });
  }

  // Delete from Supabase Auth
  const { error: authError } = await supabase.auth.admin.deleteUser(user_id);
  if (authError) return res.status(400).json({ error: authError.message });

  // Delete from users table
  const { error: dbError } = await supabase
    .from('users')
    .delete()
    .eq('id', user_id);

  if (dbError) return res.status(400).json({ error: dbError.message });

  res.status(200).json({ message: 'User deleted successfully' });
};

exports.updateUser = async (req, res) => {
  const { user_id } = req.params;
  const { email, name, phone, doj, designation, department, manager_id, college, internship_start_date, internship_end_date, manager_title } = req.body;

  // Ensure the user is under the director
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('director_id, role')
    .eq('id', user_id)
    .single();

  if (userError || !user || user.director_id !== req.user.id) {
    return res.status(403).json({ error: 'User not found or not under your division' });
  }

  // Prepare update data based on role
  const updateData = { email, name };
  if (user.role === 'employee' || user.role === 'manager') {
    updateData.phone = phone;
    updateData.doj = doj;
    updateData.designation = designation;
    updateData.department = department;
  }
  if (user.role === 'employee' && manager_id) {
    updateData.manager_id = manager_id;
  }
  if (user.role === 'intern') {
    updateData.college = college;
    updateData.internship_start_date = internship_start_date;
    updateData.internship_end_date = internship_end_date;
    if (manager_id) updateData.manager_id = manager_id;
  }
  if (user.role === 'manager') {
    updateData.manager_title = manager_title;
  }

  // Update user in Supabase Auth
  const { error: authError } = await supabase.auth.admin.updateUserById(user_id, { email });
  if (authError) return res.status(400).json({ error: authError.message });

  // Update user in users table
  const { error: dbError } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', user_id);

  if (dbError) return res.status(400).json({ error: dbError.message });

  res.status(200).json({ message: 'User updated successfully' });
};