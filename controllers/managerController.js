
const supabase = require('../config/supabase');

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

  // Validate assignee is under this manager
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

  // Verify the leave request belongs to the manager's team
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
  const { title, description } = req.body;

  const { data, error } = await supabase.from('projects').insert({
    title,
    description,
    director_id: (await supabase.from('employees').select('director_id').eq('id', req.user.id).single()).data.director_id,
  });

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json({ message: 'Project created successfully', project: data[0] });
};

exports.getTeamProgress = async (req, res) => {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', supabase.from('employees').select('id').eq('manager_id', req.user.id));

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json(data);
};
