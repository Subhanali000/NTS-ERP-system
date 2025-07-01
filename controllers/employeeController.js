
const supabase = require('../config/supabase');

exports.submitAttendance = async (req, res) => {
  const { date, punch_in, punch_out, status } = req.body;

  const { error } = await supabase.from('attendance').insert({
    user_id: req.user.id,
    date,
    punch_in,
    punch_out,
    status,
  });

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json({ message: 'Attendance submitted' });
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

exports.submitTaskProgress = async (req, res) => {
  const { task_id, progress } = req.body;

  const { error } = await supabase
    .from('tasks')
    .update({ progress, status: progress === 100 ? 'completed' : 'in_progress' })
    .eq('id', task_id)
    .eq('user_id', req.user.id);

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json({ message: 'Task progress updated' });
};

exports.submitProgress = async (req, res) => {
  const { date, accomplishments } = req.body;

  // Calculate daily progress (simple word count as a proxy, adjust as needed)
  const wordCount = accomplishments.split(' ').length;
  const daily_progress = Math.min(100, Math.round((wordCount / 50) * 100)); // Assume 50 words = 100% progress

  const { error } = await supabase.from('progress').insert({
    user_id: req.user.id,
    date,
    accomplishments,
    daily_progress,
  });

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json({ message: 'Progress submitted' });
};

exports.getProfile = async (req, res) => {
  const { data, error } = await supabase
    .from('employees')
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
    .from('leaves')
    .select('*')
    .eq('user_id', req.user.id);

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json(data);
};

exports.getTasks = async (req, res) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', req.user.id);

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json(data);
};

exports.getProgress = async (req, res) => {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', req.user.id);

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json(data);
};
