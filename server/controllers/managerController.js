const { supabase } = require('../config/supabase');


exports.addEmployee = async (req, res) => {
  const {
    email,
    name,
    phone,
    address,
    emergency_contact_name,
    emergency_contact_phone,
    employee_id,
    position,
    role,
    department,
    join_date,
    annual_salary,
    annual_leave_balance,
    college,
    internship_start_date,
    internship_end_date,
  } = req.body;

  // Required fields
  const requiredFields = { email, name, emergency_contact_name, emergency_contact_phone, employee_id, position, role, department, join_date };
  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value) return res.status(400).json({ error: `${key} is required` });
  }

  // Validate role
  const validRoles = ['employee', 'intern', 'senior_employee', 'team_lead'];
  if (!validRoles.includes(role)) return res.status(400).json({ error: 'Invalid role for manager to add' });

  // Validate department
  const validDepartments = ['hr', 'operations', 'engineering', 'tech', 'business_development', 'quality_assurance', 'systems_integration', 'client_relations'];
  if (!validDepartments.includes(department)) return res.status(400).json({ error: 'Invalid department' });

  // Check if req.user is defined
  if (!req.user || !req.user.id) {
    console.error('Authentication error: req.user or req.user.id is undefined');
    return res.status(401).json({ error: 'Authentication required or invalid token' });
  }

  // Get manager's director
  const { data: manager, error: managerError } = await supabase
    .from('employees')
    .select('director_id')
    .eq('id', req.user.id)
    .single();
  if (managerError || !manager) {
    console.error('Manager fetch error:', managerError?.message);
    return res.status(400).json({ error: 'Manager not found or invalid' });
  }
  const directorId = manager.director_id;
  if (!directorId) return res.status(400).json({ error: 'Director not assigned to manager' });

  const employeeData = {
    email,
    password: 'temppass', // Should be hashed in production
    name,
    phone,
    address,
    emergency_contact_name,
    emergency_contact_phone,
    employee_id,
    position,
    role,
    department,
    manager_id: req.user.id, // Logged-in manager's ID
    director_id: directorId, // Manager's director ID
    join_date,
    annual_salary,
    annual_leave_balance,
    college: role === 'intern' ? college : null,
    internship_start_date: role === 'intern' ? internship_start_date : null,
    internship_end_date: role === 'intern' ? internship_end_date : null,
  };

  const { data, error } = await supabase
    .from('employees')
    .insert([employeeData])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  // Update director's employee count (optional, depending on your schema)
  const { data: director, error: directorError } = await supabase
    .from('directors')
    .select('total_employees, employee_ids')
    .eq('id', directorId)
    .single();
  if (directorError || !director) {
    console.error('Director update error:', directorError?.message);
    // Proceed without updating director if not critical
  } else {
    const newEmployeeIds = [...(director.employee_ids || []), data.id];
    const newTotalEmployees = (director.total_employees || 0) + 1;
    await supabase
      .from('directors')
      .update({ total_employees: newTotalEmployees, employee_ids: newEmployeeIds })
      .eq('id', directorId);
  }

  res.status(201).json({ message: `${role} registered successfully`, employee: data });
};

// Existing functions remain unchanged
exports.viewTeamPerformance = async (req, res) => {
  const { data, error } = await supabase
    .from('employees')
    .select('*, tasks(*), attendance(*), leaves(*), progress(*)')
    .eq('manager_id', req.user.id);

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json(data);
};

exports.assignTask = async (req, res) => {
  const { project_id, title, description, assignee, priority, due_date } = req.body;

  const { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select('id, manager_id')
    .eq('id', assignee)
    .single();
  if (employeeError || !employee || employee.manager_id !== req.user.id) {
    return res.status(403).json({ error: 'Invalid assignee or not under this manager' });
  }

  const { error } = await supabase.from('tasks').insert({
    project_id,
    user_id: assignee,
    title,
    description,
    priority,
    due_date,
    assigned_by: req.user.id,
    status: 'assigned',
    progress: 0,
  });

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json({ message: 'Task assigned successfully' });
};

exports.approveLeave = async (req, res) => {
  const { leave_id, status } = req.body;

  const { data: leaveData, error: leaveError } = await supabase
    .from('leaves')
    .select('user_id')
    .eq('id', leave_id)
    .single();

  if (leaveError) return res.status(400).json({ error: leaveError.message });

  const { data: userData, error: userError } = await supabase
    .from('employees')
    .select('manager_id')
    .eq('id', leaveData.user_id)
    .single();

  if (userError || userData.manager_id !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized to approve this leave' });
  }

  const { error } = await supabase
    .from('leaves')
    .update({ manager_approval: status })
    .eq('id', leave_id);

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json({ message: 'Leave request updated' });
};

exports.applyLeave = async (req, res) => {
  const { leave_type, start_date, end_date, reason } = req.body;

  const { error } = await supabase.from('leaves').insert({
    user_id: req.user.id,
    leave_type,
    start_date,
    end_date,
    reason,
    manager_approval: 'pending',
    director_approval: 'pending',
  });

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json({ message: 'Leave request submitted' });
};

exports.getEmployees = async (req, res) => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('manager_id', req.user.id)
    .eq('role', 'employee');

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json(data);
};

exports.getInterns = async (req, res) => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('manager_id', req.user.id)
    .eq('role', 'intern');

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json(data);
};

exports.createProject = async (req, res) => {
  const { title, description, start_date, end_date } = req.body;

  if (!title || !start_date) {
    return res.status(400).json({ error: 'Title and start date are required' });
  }

  const directorId = (await supabase.from('employees').select('director_id').eq('id', req.user.id).single()).data.director_id;
  const { data, error } = await supabase
    .from('projects')
    .insert([{
      title,
      description,
      director_id: directorId,
      manager_id: req.user.id,
      start_date,
      end_date,
      status: 'planning',
    }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Project created', project: data });
};

exports.getTeamProgress = async (req, res) => {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', (await supabase.from('employees').select('id').eq('manager_id', req.user.id)).data.map(e => e.id));

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json(data);
};

exports.getActiveProjects = async (req, res) => {
  try {
    const userId = req.user?.id;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('manager_id', userId)
      .eq('status', 'active');

    if (error) return res.status(400).json({ error: error.message });

    res.json({ active_projects: data });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error });
  }
};