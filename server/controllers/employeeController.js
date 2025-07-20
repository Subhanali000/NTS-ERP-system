// ✅ Correct import
const { supabase } = require('../config/supabase');
// controller
exports.updateAttendance = async (req, res) => {
  const { punch_out } = req.body;
  const userId = req.user.id;
  const date = req.params.date;

  const { error } = await supabase
    .from('attendance')
    .update({ punch_out })
    .match({ user_id: userId, date });

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ message: 'Attendance updated successfully' });
};


// ✅ Submit Attendance
exports.submitAttendance = async (req, res) => {
  const { date, punch_in, punch_out, status } = req.body;
  const userId = req.user.id;

  const { error } = await supabase.from('attendance').insert({
    user_id: userId,
    date,
    punch_in,
    punch_out,
    status,
  });

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ message: 'Attendance submitted' });
};

// ✅ Apply for Leave
exports.applyLeave = async (req, res) => {
  const { leave_type, start_date, end_date, reason } = req.body;
  const userId = req.user.id;

  const { error } = await supabase.from('leaves').insert({
    user_id: userId,
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

// ✅ Submit Task Progress
exports.submitTaskProgress = async (req, res) => {
  const { task_id, progress } = req.body;
  const userId = req.user.id;

  const { error } = await supabase
    .from('tasks')
    .update({
      progress,
      status: progress === 100 ? 'completed' : 'in_progress',
    })
    .eq('id', task_id)
    .eq('user_id', userId);

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ message: 'Task progress updated' });
};
exports.submitDailyProgress = async (req, res) => {
  const userId = req.user.id;
  const { content, date } = req.body;
  const files = req.files;

  let attachmentUrls = [];

  if (files && files.length > 0) {
    for (const file of files) {
      const fileName = `${Date.now()}_${file.originalname}`;
      const { data, error } = await supabase.storage
        .from('attachments')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) return res.status(500).json({ error: error.message });

      const publicUrl = supabase.storage
        .from('attachments')
        .getPublicUrl(fileName).data.publicUrl;

      attachmentUrls.push(publicUrl);
    }
  }

  const { data, error } = await supabase
    .from('daily_progress')
    .insert({
      user_id: userId,
      content,
      date,
      attachments: attachmentUrls,
      submitted_at: new Date().toISOString(),
      status: 'submitted',
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

// ✅ Submit Daily Progress
exports.submitProgressreport = async (req, res) => {
  const { date, accomplishments } = req.body;
  const userId = req.user.id;

  const wordCount = accomplishments.split(' ').length;
  const daily_progress = Math.min(100, Math.round((wordCount / 50) * 100));

  const { error } = await supabase.from('progress').insert({
    user_id: userId,
    date,
    accomplishments,
    daily_progress,
  });

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ message: 'Progress submitted' });
};

// ✅ Get Profile
exports.getProfile = async (req, res) => {
  const userId = req.user.id;

  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
};

// ✅ Get Attendance
exports.getAttendance = async (req, res) => {
  const userId = req.user.id;

  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', userId);

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
};
exports.getdailyProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('progress')// here uopdate table name to dail-progress
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      throw error;
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching progress', error: err.message });
  }
};

// ✅ Get Leaves
exports.getLeaves = async (req, res) => {
  const userId = req.user.id;

  const { data, error } = await supabase
    .from('leaves')
    .select('*')
    .eq('user_id', userId);

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
};

// ✅ Get Tasks
exports.getTasks = async (req, res) => {
  const userId = req.user.id;

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId);

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
};

exports.getProgressreport = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    let query = supabase.from('progress').select('*');

    if (userRole === 'employee') {
      // Employees can only see their own reports
      query = query.eq('user_id', userId);
    } else if (userRole === 'manager') {
      // Managers see only employee reports
      // Assume users table has: id, manager_id, role
      const { data: employees, error: empError } = await supabase
        .from('users')
        .select('id')
        .eq('manager_id', userId)
        .eq('role', 'employee');

      if (empError) throw empError;

      const employeeIds = employees.map(e => e.id);
      query = query.in('user_id', employeeIds);
    } else if (userRole === 'director') {
      // Directors see only manager reports
      const { data: managers, error: mgrError } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'manager');

      if (mgrError) throw mgrError;

      const managerIds = managers.map(m => m.id);
      query = query.in('user_id', managerIds);
    } else {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    const { data, error } = await query;

    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json(data);
  } catch (err) {
    console.error('Fetch Error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
exports.getProgress = async (req, res) => {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', req.user.id);

  if (error) return res.status(400).json({ error: error.message });

  res.status(200).json(data);
};
