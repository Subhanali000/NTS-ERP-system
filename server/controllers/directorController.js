
const { supabase } = require('../config/supabase');


exports.addEmployee = async (req, res) => {
  const {
    email, name, phone, address, emergency_contact_name, emergency_contact_phone,
    employee_id, position, role, department, manager_id, join_date, annual_salary,
    annual_leave_balance, college, internship_start_date, internship_end_date, manager_title
  } = req.body;

  const requiredFields = { email, name, emergency_contact_name, emergency_contact_phone, employee_id, position, role, department, join_date };
  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value) return res.status(400).json({ error: `${key} is required` });
  }

  const validRoles = ['employee', 'intern', 'senior_employee', 'team_lead', 'talent_acquisition_manager', 'project_tech_manager', 'quality_assurance_manager', 'software_development_manager', 'systems_integration_manager', 'client_relations_manager'];
  if (!validRoles.includes(role)) return res.status(400).json({ error: 'Invalid role' });

  const validDepartments = ['Human Resources', 'Operations', 'Engineering', 'Technology', 'Business Development', 'Quality Assurance', 'Systems Integration', 'Client Relations'];
  if (!validDepartments.includes(department)) return res.status(400).json({ error: 'Invalid department' });

  if (manager_id) {
    console.log('Validating manager_id:', manager_id); // Debug log
    const { data: manager, error: managerError } = await supabase
      .from('employees')
      .select('id, role, director_id')
      .eq('id', manager_id)
      .single();
    if (managerError) {
      console.error('Manager fetch error:', managerError.message);
      return res.status(400).json({ error: 'Invalid manager ID' });
    }
    if (!manager) {
      return res.status(400).json({ error: 'Manager not found' });
    }
    const managerRoles = ['talent_acquisition_manager', 'project_tech_manager', 'quality_assurance_manager', 'software_development_manager', 'systems_integration_manager', 'client_relations_manager'];
    if (!managerRoles.includes(manager.role) || manager.director_id !== req.user.id) {
      return res.status(400).json({ error: 'Invalid manager ID or manager not under this director' });
    }
  }

  const { data: director, error: directorError } = await supabase
    .from('directors')
    .select('id, total_employees, total_managers, employee_ids')
    .eq('id', req.user.id)
    .single();
  if (directorError || !director) return res.status(400).json({ error: 'Director not found' });

  const employeeData = {
    email,
    password: 'temppass',
    name,
    phone,
    address,
    emergency_contact_name,
    emergency_contact_phone,
    employee_id,
    position,
    role,
    department,
    manager_id: ['employee', 'intern', 'senior_employee', 'team_lead'].includes(role) ? manager_id : null,
    director_id: req.user.id,
    join_date,
    annual_salary,
    annual_leave_balance,
    college: role === 'intern' ? college : null,
    internship_start_date: role === 'intern' ? internship_start_date : null,
    internship_end_date: role === 'intern' ? internship_end_date : null,
    manager_title: role.includes('manager') ? manager_title : null
  };

  const { data, error } = await supabase
    .from('employees')
    .insert([employeeData])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  const newEmployeeIds = [...director.employee_ids, data.id];
  const newTotalEmployees = director.total_employees + 1;
  const newTotalManagers = director.total_managers + (role.includes('manager') ? 1 : 0);

  await supabase
    .from('directors')
    .update({ total_employees: newTotalEmployees, total_managers: newTotalManagers, employee_ids: newEmployeeIds })
    .eq('id', req.user.id);

  res.status(201).json({ message: `${role} registered successfully`, employee: data });
};

exports.createProject = async (req, res) => {


  const { title, description, start_date, end_date } = req.body;

  if (!title || !start_date) {
    return res.status(400).json({ error: 'Title and start date are required' });
  }

  const { data, error } = await supabase
    .from('projects')
    .insert([{ title, description, director_id: req.user.id, start_date, end_date, status: 'active' }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Project created', project: data });
};

exports.assignEmployee = async (req, res) => {


  const { employee_id, project_id } = req.body;

  const { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select('id, director_id, role')
    .eq('id', employee_id)
    .single();
  if (employeeError || !employee || employee.director_id !== req.user.id || !['employee', 'intern', 'senior_employee', 'team_lead'].includes(employee.role)) {
    return res.status(400).json({ error: 'Invalid employee ID or employee not under this director' });
  }

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('director_id')
    .eq('id', project_id)
    .single();
  if (projectError || !project || project.director_id !== req.user.id) {
    return res.status(400).json({ error: 'Invalid project ID or project not managed by this director' });
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert([{ project_id, user_id: employee_id, title: `Assigned to ${employee.name}`, description: 'Automatic assignment by director' }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Employee assigned to project successfully', task: data });
};

exports.approveLeave = async (req, res) => {


  const { leave_id, status } = req.body;
  const { data: leave, error: leaveError } = await supabase
    .from('leaves')
    .select('*, user:employees!user_id(director_id)')
    .eq('id', leave_id)
    .single();

  if (leaveError || leave.user.director_id !== req.user.id) return res.status(403).json({ error: 'Invalid leave request or permission' });

  const { data, error } = await supabase
    .from('leaves')
    .update({ director_approval: status, status: status ? 'approved' : 'rejected' })
    .eq('id', leave_id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Leave request updated', leave: data });
};

exports.viewDivisionData = async (req, res) => {


  const { data, error } = await supabase
    .from('employees')
    .select('id, email, name, role, department, employee_id')
    .eq('director_id', req.user.id);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

exports.getTotalEmployees = async (req, res) => {


  const { data: director, error } = await supabase
    .from('directors')
    .select('total_employees')
    .eq('id', req.user.id)
    .single();

  if (error || !director) return res.status(400).json({ error: 'Director not found' });
  res.json({ total_employees: director.total_employees });
};

exports.getActiveProjects = async (req, res) => {


  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('director_id', req.user.id)
    .eq('status', 'active');

  if (error) return res.status(400).json({ error: error.message });
  res.json({ active_projects: data });
};

exports.getDepartments = async (req, res) => {


  const { data, error } = await supabase
    .from('employees')
    .select('department')
    .eq('director_id', req.user.id)
    .distinct();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ departments: data.map(row => row.department) });
};

exports.getAvgPerformance = async (req, res) => {


  const { data, error } = await supabase
    .from('tasks')
    .select('progress')
    .eq('user_id', supabase.from('employees').select('id').eq('director_id', req.user.id));

  if (error) return res.status(400).json({ error: error.message });

  const totalProgress = data.reduce((sum, task) => sum + task.progress, 0);
  const avgPerformance = data.length > 0 ? totalProgress / data.length : 0;
  res.json({ avg_performance: avgPerformance });
};

exports.getAllEmployees = async (req, res) => {


  const { data, error } = await supabase
    .from('employees')
    .select('id, email, name, role, department, employee_id')
    .eq('director_id', req.user.id)
    .in('role', ['employee', 'senior_employee', 'team_lead']);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

exports.getAllInterns = async (req, res) => {


  const { data, error } = await supabase
    .from('employees')
    .select('id, email, name, role, department, employee_id')
    .eq('director_id', req.user.id)
    .eq('role', 'intern');

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

exports.getAllManagers = async (req, res) => {
  try {
    // Debug log for user role
    console.log('User role in getAllManagers:', req.user?.role);

    // Validate req.user and role
    if (!req.user || !req.user.id || !req.user.role) {
      return res.status(401).json({ error: 'Authentication required or invalid user data' });
    }

    const isDirector = [
      'Global HR Director',
      'Global Operations Director',
      'Engineering Director',
      'Director – Tech Team',
      'Director – Business Development'
    ].includes(req.user.role);
    if (!isDirector) {
      return res.status(403).json({ error: 'Only directors can view managers' });
    }

    // Define manager roles
    const managerRoles = [
      'talent_acquisition_manager',
      'project_tech_manager',
      'quality_assurance_manager',
      'software_development_manager',
      'systems_integration_manager',
      'client_relations_manager'
    ];

    // Fetch managers with additional filters (e.g., active status)
    const { data, error } = await supabase
      .from('employees')
      .select('id, name, role, department')
      .eq('director_id', req.user.id)
      .in('role', managerRoles)
      .order('name', { ascending: true }); // Optional: Sort by name for better UX

    // Check for database errors
    if (error) {
      console.error('Database error in getAllManagers:', error.message);
      throw new Error('Failed to fetch managers from database');
    }

    // Check if no managers found
    if (!data || data.length === 0) {
      console.log('No managers found for director:', req.user.id);
      return res.status(200).json([]); // Return empty array instead of error
    }

    // Return successful response
    res.status(200).json(data);
  } catch (error) {
    // Enhanced error handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error in getAllManagers:', errorMessage);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteUser = async (req, res) => {


  const { user_id } = req.params;
  const { data: user, error: userError } = await supabase
    .from('employees')
    .select('director_id')
    .eq('id', user_id)
    .single();

  if (userError || !user || user.director_id !== req.user.id) {
    return res.status(403).json({ error: 'User not found or not under your division' });
  }

  const { data: director, error: directorError } = await supabase
    .from('directors')
    .select('total_employees, total_managers, employee_ids')
    .eq('id', req.user.id)
    .single();
  if (directorError || !director) return res.status(400).json({ error: 'Director not found' });

  const newEmployeeIds = director.employee_ids.filter(id => id !== user_id);
  const newTotalEmployees = director.total_employees - 1;
  const newTotalManagers = director.total_managers - (['manager', 'talent_acquisition_manager', 'project_tech_manager', 'quality_assurance_manager', 'software_development_manager', 'systems_integration_manager', 'client_relations_manager'].includes(user.role) ? 1 : 0);

  await supabase
    .from('directors')
    .update({ total_employees: newTotalEmployees, total_managers: newTotalManagers, employee_ids: newEmployeeIds })
    .eq('id', req.user.id);

  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', user_id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'User deleted successfully' });
};

exports.updateUser = async (req, res) => {


  const { user_id } = req.params;
  const {
    email, name, phone, address, emergency_contact_name, emergency_contact_phone,
    employee_id, position, role, department, manager_id, join_date, annual_salary,
    annual_leave_balance, college, internship_start_date, internship_end_date, manager_title
  } = req.body;

  const { data: user, error: userError } = await supabase
    .from('employees')
    .select('director_id, role')
    .eq('id', user_id)
    .single();

  if (userError || !user || user.director_id !== req.user.id) {
    return res.status(403).json({ error: 'User not found or not under your division' });
  }

  const updateData = { email, name, phone, address, emergency_contact_name, emergency_contact_phone, employee_id, position, role, department, join_date, annual_salary, annual_leave_balance };
  if (['employee', 'senior_employee', 'team_lead'].includes(role) && manager_id) {
    updateData.manager_id = manager_id;
  }
  if (role === 'intern') {
    updateData.college = college;
    updateData.internship_start_date = internship_start_date;
    updateData.internship_end_date = internship_end_date;
    updateData.manager_id = manager_id;
  }
  if (role.includes('manager')) {
    updateData.manager_title = manager_title;
    updateData.manager_id = null;
  }

  const { error } = await supabase
    .from('employees')
    .update(updateData)
    .eq('id', user_id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'User updated successfully' });
};

exports.generateDocument = async (req, res) => {
  if (req.user.role !== 'director') return res.status(403).json({ error: 'Only directors can generate documents' });

  const { user_id, type, content } = req.body;
  if (!['offer_letter', 'experience_certificate', 'lor', 'internship_certificate'].includes(type)) {
    return res.status(400).json({ error: 'Invalid document type' });
  }

  const { data: user, error: userError } = await supabase
    .from('employees')
    .select('director_id')
    .eq('id', user_id)
    .single();

  if (userError || user.director_id !== req.user.id) return res.status(403).json({ error: 'Invalid user or permission' });

  const { data, error } = await supabase
    .from('documents')
    .insert([{ user_id, director_id: req.user.id, type, content }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Document generated', document: data });
};

exports.getTeamProgress = async (req, res) => {


  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', supabase.from('employees').select('id').eq('director_id', req.user.id));

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json(data);
};
exports.getAllTasks = async (req, res) => {
 

  const { data: employeeIds, error: employeeError } = await supabase
    .from('employees')
    .select('id')
    .eq('director_id', req.user.id);

  if (employeeError) return res.status(400).json({ error: employeeError.message });

  const employeeIdList = employeeIds.map(emp => emp.id);
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .in('user_id', employeeIdList);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

exports.getProgressReports = async (req, res) => {


  const { data: employeeIds, error: employeeError } = await supabase
    .from('employees')
    .select('id')
    .eq('director_id', req.user.id);

  if (employeeError) return res.status(400).json({ error: employeeError.message });

  const employeeIdList = employeeIds.map(emp => emp.id);
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .in('user_id', employeeIdList);

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

exports.getAttendance = async (req, res) => {


  const { data, error } = await supabase
    .from('attendance')
    .select('*')


  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};