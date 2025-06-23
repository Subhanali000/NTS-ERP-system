const supabase = require('../config/supabase');

exports.submitAttendance = async (req, res) => {
  const { date, status } = req.body;

  const { error } = await supabase.from('attendance').insert({
    user_id: req.user.id,
    date,
    status,
  });

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json({ message: 'Attendance submitted' });
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

exports.submitTaskProgress = async (req, res) => {
  const { task_id, progress } = req.body;

  const { error } = await supabase
    .from('tasks')
    .update({ progress, status: progress === 100 ? 'completed' : 'in_progress' })
    .eq('id', task_id)
    .eq('assigned_to', req.user.id);

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json({ message: 'Task progress updated' });
};

exports.getProfile = async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json(data);
};

exports.getAttendance = async (req, res) => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', req.user.id);

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json(data);
};

exports.getLeaves = async (req, res) => {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('user_id', req.user.id);

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json(data);
};

exports.getTasks = async (req, res) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('assigned_to', req.user.id);

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json(data);
};