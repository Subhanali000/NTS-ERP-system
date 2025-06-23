const supabase = require('../config/supabase');

exports.viewTeamPerformance = async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*, tasks(*), attendance(*), leave_requests(*)')
    .eq('manager_id', req.user.id);

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json(data);
};

exports.assignTask = async (req, res) => {
  const { project_id, task_name, assigned_to } = req.body;

  const { error } = await supabase.from('tasks').insert({
    project_id,
    task_name,
    assigned_to,
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
    .from('leave_requests')
    .select('user_id')
    .eq('id', leave_id)
    .single();

  if (leaveError) return res.status(400).json({ error: leaveError.message });

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('manager_id')
    .eq('id', leaveData.user_id)
    .single();

  if (userError || userData.manager_id !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized to approve this leave' });
  }

  const { error } = await supabase
    .from('leave_requests')
    .update({ manager_approval: status })
    .eq('id', leave_id);

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json({ message: 'Leave request updated' });
};

exports.applyLeave = async (req, res) => {
  const { start_date, end_date, reason } = req.body;

  const { error } = await supabase.from('leave_requests').insert({
    user_id: req.user.id,
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
    .from('users')
    .select('*')
    .eq('manager_id', req.user.id)
    .eq('role', 'employee');

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json(data);
};

exports.getInterns = async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('manager_id', req.user.id)
    .eq('role', 'intern');

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json(data);
};

exports.createProject = async (req, res) => {
  const { name, description } = req.body;

  const { data, error } = await supabase.from('projects').insert({
    name,
    description,
    created_by: req.user.id,
  });

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json({ message: 'Project created successfully', project: data[0] });
};