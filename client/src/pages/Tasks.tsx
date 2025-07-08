import React, { useState } from 'react';
import { Plus, Filter, Calendar, User, Flag, CheckCircle, Clock, AlertCircle, TrendingUp, Send, Edit, Trash2, Eye, MessageSquare } from 'lucide-react';
import { getCurrentUser, isDirector, isManager } from '../utils/auth';
import { mockTasks, mockProjects, mockUsers } from '../data/mockData';
import { formatDate, getDaysUntilDeadline, isOverdue } from '../utils/dateUtils';

const Tasks: React.FC = () => {
  const user = getCurrentUser();
  const [activeTab, setActiveTab] = useState<'my-tasks' | 'team-tasks'>('my-tasks');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [tasks, setTasks] = useState(mockTasks);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const canManageTasks = isDirector(user.role) || isManager(user.role);
  
  const myTasks = tasks.filter(t => t.assigneeId === user.id);
  const teamTasks = canManageTasks ? tasks.filter(t => {
    const assignee = mockUsers.find(u => u.id === t.assigneeId);
    return assignee?.managerId === user.id;
  }) : [];

  const currentTasks = activeTab === 'my-tasks' ? myTasks : teamTasks;
  const filteredTasks = currentTasks.filter(task => {
    const matchesStatus = !filterStatus || task.status === filterStatus;
    const matchesPriority = !filterPriority || task.priority === filterPriority;
    return matchesStatus && matchesPriority;
  });

  const handleCreateTask = (taskData: any) => {
    const newTask = {
      id: `task-${Date.now()}`,
      projectId: taskData.projectId,
      title: taskData.title,
      description: taskData.description,
      assigneeId: taskData.assigneeId,
      status: 'todo' as const,
      priority: taskData.priority,
      dueDate: taskData.dueDate,
      progressPct: 0,
      createdAt: new Date().toISOString()
    };

    setTasks(prev => [...prev, newTask]);
    setShowCreateForm(false);
    console.log('Task created successfully');
  };

  const handleUpdateProgress = (taskId: string, progressData: any) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, progressPct: progressData.progress, status: progressData.status }
        : task
    ));
    setShowProgressForm(false);
    setSelectedTask(null);
    console.log('Task progress updated successfully');
  };

  const handleEditTask = (taskId: string, taskData: any) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, ...taskData }
        : task
    ));
    setShowEditForm(false);
    setSelectedTask(null);
    console.log('Task updated successfully');
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
      console.log('Task deleted successfully');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'review': return <AlertCircle className="w-4 h-4 text-purple-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const TaskCard = ({ task, showAssignee = false }: { task: any; showAssignee?: boolean }) => {
    const project = mockProjects.find(p => p.id === task.projectId);
    const assignee = mockUsers.find(u => u.id === task.assigneeId);
    const daysUntil = getDaysUntilDeadline(task.dueDate);
    const overdue = isOverdue(task.dueDate);
    const isMyTask = task.assigneeId === user.id;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-medium text-gray-900">{task.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              {getStatusIcon(task.status)}
            </div>
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>{project?.title}</span>
              {showAssignee && assignee && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <img
                      src={assignee.avatar}
                      alt={assignee.name}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span>{assignee.name}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          {canManageTasks && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  setSelectedTask(task.id);
                  setShowEditForm(true);
                }}
                className="p-1 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                title="Edit Task"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="p-1 hover:bg-red-50 text-red-600 rounded transition-colors"
                title="Delete Task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
              {task.status.replace('_', ' ')}
            </span>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span className={overdue ? 'text-red-600 font-medium' : ''}>
                {overdue ? `${Math.abs(daysUntil)} days overdue` : 
                 daysUntil === 0 ? 'Due today' :
                 daysUntil > 0 ? `${daysUntil} days left` : 'Completed'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${task.progressPct}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{task.progressPct}%</span>
            {isMyTask && task.status !== 'completed' && (
              <button
                onClick={() => {
                  setSelectedTask(task.id);
                  setShowProgressForm(true);
                }}
                className="ml-2 p-1 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                title="Update Progress"
              >
                <TrendingUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CreateTaskForm = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      projectId: '',
      assigneeId: '',
      priority: 'medium',
      dueDate: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
      const newErrors: Record<string, string> = {};
      
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (!formData.projectId) newErrors.projectId = 'Project is required';
      if (!formData.assigneeId) newErrors.assigneeId = 'Assignee is required';
      if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
      
      if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (validateForm()) {
        handleCreateTask(formData);
      }
    };

    const teamMembers = mockUsers.filter(u => u.managerId === user.id);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Create New Task</h3>
            <p className="text-gray-600 mt-1">Assign a new task to your team member</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter task title..."
                />
                {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Describe the task requirements and objectives..."
                />
                {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project *</label>
                <select 
                  value={formData.projectId}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.projectId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select project...</option>
                  {mockProjects.map(project => (
                    <option key={project.id} value={project.id}>{project.title}</option>
                  ))}
                </select>
                {errors.projectId && <p className="text-red-600 text-sm mt-1">{errors.projectId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assignee *</label>
                <select 
                  value={formData.assigneeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, assigneeId: e.target.value }))}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.assigneeId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select team member...</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
                {errors.assigneeId && <p className="text-red-600 text-sm mt-1">{errors.assigneeId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
                <select 
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.dueDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.dueDate && <p className="text-red-600 text-sm mt-1">{errors.dueDate}</p>}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Task</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ProgressUpdateForm = () => {
    const task = tasks.find(t => t.id === selectedTask);
    const [formData, setFormData] = useState({
      progress: task?.progressPct || 0,
      status: task?.status || 'todo',
      comments: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedTask) {
        handleUpdateProgress(selectedTask, formData);
      }
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Update Task Progress</h3>
            <p className="text-gray-600 mt-1">Update your progress on this task</p>
          </div>
          
          <div className="p-6">
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">{task?.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{task?.description}</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Progress Percentage</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>0%</span>
                  <span className="font-bold text-blue-600">{formData.progress}%</span>
                  <span>100%</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Update</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Ready for Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Progress Notes</label>
                <textarea
                  rows={4}
                  value={formData.comments}
                  onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe what you've accomplished, challenges faced, and next steps..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Update Progress</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProgressForm(false);
                    setSelectedTask(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const EditTaskForm = () => {
    const task = tasks.find(t => t.id === selectedTask);
    const [formData, setFormData] = useState({
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'medium',
      dueDate: task?.dueDate || '',
      assigneeId: task?.assigneeId || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedTask) {
        handleEditTask(selectedTask, formData);
      }
    };

    const teamMembers = mockUsers.filter(u => u.managerId === user.id);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Edit Task</h3>
            <p className="text-gray-600 mt-1">Update task details</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assignee</label>
                <select 
                  value={formData.assigneeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, assigneeId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select 
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowEditForm(false);
                  setSelectedTask(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Update Task</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {canManageTasks ? 'Team & Task Management' : 'My Tasks'}
          </h1>
          <p className="text-gray-600 mt-1">
            {canManageTasks 
              ? 'Manage your team tasks and track progress' 
              : 'Track your assigned tasks and update progress'
            }
          </p>
        </div>
        {canManageTasks && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {canManageTasks ? 'Total Tasks' : 'My Tasks'}
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {canManageTasks ? teamTasks.length + myTasks.length : myTasks.length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {(canManageTasks ? [...teamTasks, ...myTasks] : myTasks)
                  .filter(t => t.status === 'in_progress').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {(canManageTasks ? [...teamTasks, ...myTasks] : myTasks)
                  .filter(t => t.status === 'completed').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {(canManageTasks ? [...teamTasks, ...myTasks] : myTasks)
                  .filter(t => isOverdue(t.dueDate) && t.status !== 'completed').length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-100">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('my-tasks')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my-tasks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Tasks ({myTasks.length})
            </button>
            {canManageTasks && (
              <button
                onClick={() => setActiveTab('team-tasks')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'team-tasks'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Team Tasks ({teamTasks.length})
              </button>
            )}
          </nav>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
            </select>
            <select 
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                showAssignee={activeTab === 'team-tasks'} 
              />
            ))}
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No tasks found</p>
              {canManageTasks && activeTab === 'team-tasks' && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Create your first task
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateForm && <CreateTaskForm />}
      {showProgressForm && <ProgressUpdateForm />}
      {showEditForm && <EditTaskForm />}
    </div>
  );
};

export default Tasks;