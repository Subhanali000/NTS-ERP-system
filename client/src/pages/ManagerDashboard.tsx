import React, { useState } from 'react';
import { Users, ClipboardList, Calendar, TrendingUp, CheckCircle, Briefcase, BarChart3, Target, UserCheck, Plus, Clock, AlertTriangle, MessageSquare, Award, Star, Eye, Edit, Trash2, Send, Filter, Search, UserPlus } from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import { mockUsers, mockTasks, mockLeaveRequests, mockProgressReports, mockProjects } from '../data/mockData';
import { formatDate, getDaysUntilDeadline, isOverdue, getRelativeDate, formatDateTime } from '../utils/dateUtils';
import { getRoleDisplayName } from '../utils/auth';
import AddEmployee from '../components/Manager/AddEmployee';

const ManagerDashboard: React.FC = () => {
  const user = getCurrentUser();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showLeaveReview, setShowLeaveReview] = useState<string | null>(null);
  const [showProgressReview, setShowProgressReview] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState(mockUsers.filter(u => u.managerId === user.id));

  // Get team data
  const teamTasks = mockTasks.filter(t => 
    teamMembers.some(member => member.id === t.assigneeId)
  );
  const pendingLeaveRequests = mockLeaveRequests.filter(lr => 
    lr.status === 'pending' && teamMembers.some(tm => tm.id === lr.userId)
  );
  const teamProgressReports = mockProgressReports.filter(r =>
    teamMembers.some(member => member.id === r.userId)
  );
  const managedProjects = mockProjects.filter(p => p.managerId === user.id);

  // Calculate metrics
  const completedTasks = teamTasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = teamTasks.filter(t => t.status === 'in_progress').length;
  const overdueTasks = teamTasks.filter(t => isOverdue(t.dueDate) && t.status !== 'completed').length;
  const pendingReports = teamProgressReports.filter(r => !r.approved).length;

  // Mock data for 4 teams
  const teams = [
    {
      id: 'team-1',
      name: 'Team-1',
      members: 3,
      progress: 85,
      activeTasks: 8,
      completedTasks: 12,
      color: 'from-blue-500 to-blue-600',
      icon: '💻'
    },
    {
      id: 'team-2',
      name: 'Team-2',
      members: 4,
      progress: 92,
      activeTasks: 6,
      completedTasks: 15,
      color: 'from-green-500 to-green-600',
      icon: '⚙️'
    },
    {
      id: 'team-3',
      name: 'Team-3',
      members: 2,
      progress: 78,
      activeTasks: 5,
      completedTasks: 9,
      color: 'from-purple-500 to-purple-600',
      icon: '🎨'
    },
    {
      id: 'team-4',
      name: 'Team-4',
      members: 3,
      progress: 88,
      activeTasks: 7,
      completedTasks: 11,
      color: 'from-orange-500 to-orange-600',
      icon: '🔍'
    }
  ];

  const getPerformanceScore = (memberId: string) => {
    const memberTasks = teamTasks.filter(t => t.assigneeId === memberId);
    if (memberTasks.length === 0) return 85;
    
    const completedTasks = memberTasks.filter(t => t.status === 'completed').length;
    const avgProgress = memberTasks.reduce((sum, task) => sum + task.progressPct, 0) / memberTasks.length;
    return Math.round((completedTasks / memberTasks.length) * 50 + avgProgress * 0.5);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleLeaveApproval = (requestId: string, approved: boolean) => {
    console.log(`${approved ? 'Approved' : 'Rejected'} leave request:`, requestId);
    setShowLeaveReview(null);
  };

  const handleProgressApproval = (reportId: string, approved: boolean, comments?: string) => {
    console.log(`${approved ? 'Approved' : 'Rejected'} progress report:`, reportId, comments);
    setShowProgressReview(null);
  };

  const handleAddEmployee = (newEmployee: any) => {
    setTeamMembers(prev => [...prev, newEmployee]);
    console.log('New employee added:', newEmployee);
    // TODO: Send to backend
  };

  const CreateTaskForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Create New Task</h3>
          <p className="text-gray-600 mt-1">Assign a new task to your team member</p>
        </div>
        <form className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Task Title *</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter task title..."
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the task requirements and objectives..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project *</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                <option value="">Select project...</option>
                {managedProjects.map(project => (
                  <option key={project.id} value={project.id}>{project.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assignee *</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                <option value="">Select team member...</option>
                {teamMembers.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowCreateTask(false)}
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

  const LeaveReviewModal = ({ requestId }: { requestId: string }) => {
    const request = pendingLeaveRequests.find(r => r.id === requestId);
    const requester = teamMembers.find(u => u.id === request?.userId);
    
    if (!request || !requester) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Leave Request</h3>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-3">
              <img
                src={requester.avatar}
                alt={requester.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-gray-900">{requester.name}</p>
                <p className="text-sm text-gray-600">{getRoleDisplayName(requester.role)}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Type</p>
                  <p className="font-medium capitalize">{request.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-gray-600">Duration</p>
                  <p className="font-medium">{formatDate(request.startDate)} - {formatDate(request.endDate)}</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-gray-600 text-sm">Reason</p>
                <p className="font-medium">{request.reason}</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => handleLeaveApproval(request.id, true)}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve</span>
            </button>
            <button
              onClick={() => handleLeaveApproval(request.id, false)}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Reject</span>
            </button>
            <button
              onClick={() => setShowLeaveReview(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ProgressReviewModal = ({ reportId }: { reportId: string }) => {
    const [comments, setComments] = useState('');
    const report = teamProgressReports.find(r => r.id === reportId);
    const task = mockTasks.find(t => t.id === report?.taskId);
    const employee = teamMembers.find(u => u.id === report?.userId);
    
    if (!report || !task || !employee) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Progress Report</h3>
          
          <div className="space-y-6 mb-6">
            <div className="flex items-center space-x-3">
              <img
                src={employee.avatar}
                alt={employee.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900">{employee.name}</p>
                <p className="text-sm text-gray-600">{getRoleDisplayName(employee.role)}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{task.description}</p>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${report.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{report.progress}%</span>
                </div>
                <span className="text-xs text-gray-500">
                  Updated {getRelativeDate(report.timestamp)}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Employee Comments</h4>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-gray-700">{report.comments}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Manager Feedback</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Provide feedback on the progress report..."
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => handleProgressApproval(report.id, true, comments)}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve</span>
            </button>
            <button
              onClick={() => handleProgressApproval(report.id, false, comments)}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Request Changes</span>
            </button>
            <button
              onClick={() => setShowProgressReview(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
            Manager Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Manage your team and projects effectively</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddEmployee(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <UserPlus className="w-5 h-5" />
            <span>Add Employee</span>
          </button>
          <button
            onClick={() => setShowCreateTask(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Teams</p>
              <p className="text-3xl font-bold mt-2">4</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Completed Tasks</p>
              <p className="text-3xl font-bold mt-2">{completedTasks}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Pending Approvals</p>
              <p className="text-3xl font-bold mt-2">{pendingLeaveRequests.length + pendingReports}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Active Projects</p>
              <p className="text-3xl font-bold mt-2">{managedProjects.filter(p => p.status === 'active').length}</p>
            </div>
            <Briefcase className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Team Overview */}
        <div className="lg:col-span-2 space-y-8">
          {/* Teams Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <Users className="w-6 h-6 text-blue-600" />
                <span>Teams Progress</span>
              </h3>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">4 teams</span>
                <button
                  onClick={() => setShowAddEmployee(true)}
                  className="bg-green-100 text-green-700 px-3 py-1 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium flex items-center space-x-1"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teams.map(team => (
                <div key={team.id} className={`bg-gradient-to-br ${team.color} rounded-xl p-6 text-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-3xl">{team.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-white">{team.name}</h4>
                      <p className="text-white/80 text-sm">{team.members} members</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80 text-sm">Progress</span>
                      <span className="text-xl font-bold text-white">{team.progress}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="bg-white h-2 rounded-full transition-all duration-500"
                        style={{ width: `${team.progress}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">{team.activeTasks}</p>
                        <p className="text-xs text-white/70">Active</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">{team.completedTasks}</p>
                        <p className="text-xs text-white/70">Completed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-white">{Math.round(team.progress)}%</p>
                        <p className="text-xs text-white/70">Progress</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <ClipboardList className="w-6 h-6 text-green-600" />
                <span>Recent Team Tasks</span>
              </h3>
              <a href="/tasks" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All Tasks
              </a>
            </div>
            
            <div className="space-y-3">
              {teamTasks.slice(0, 5).map(task => {
                const assignee = teamMembers.find(u => u.id === task.assigneeId);
                const daysUntil = getDaysUntilDeadline(task.dueDate);
                const overdue = isOverdue(task.dueDate);
                
                return (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <img
                            src={assignee?.avatar}
                            alt={assignee?.name}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span>{assignee?.name}</span>
                        </div>
                        <span className={overdue ? 'text-red-600 font-medium' : ''}>
                          {overdue ? `${Math.abs(daysUntil)} days overdue` : 
                           daysUntil === 0 ? 'Due today' :
                           daysUntil > 0 ? `${daysUntil} days left` : 'Completed'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${task.progressPct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8">{task.progressPct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {teamTasks.length === 0 && (
              <div className="text-center py-8">
                <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No team tasks yet</p>
                <button
                  onClick={() => setShowCreateTask(true)}
                  className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Create your first task
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Approvals & Quick Actions */}
        <div className="space-y-6">
          {/* Pending Leave Requests */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                <span>Leave Requests</span>
              </h3>
              {pendingLeaveRequests.length > 0 && (
                <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                  {pendingLeaveRequests.length} pending
                </span>
              )}
            </div>
            
            {pendingLeaveRequests.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No pending requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingLeaveRequests.slice(0, 3).map(request => {
                  const requester = teamMembers.find(u => u.id === request.userId);
                  return (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                      <div className="flex items-center space-x-2 mb-2">
                        <img
                          src={requester?.avatar}
                          alt={requester?.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{requester?.name}</p>
                          <p className="text-xs text-gray-600 capitalize">{request.type.replace('_', ' ')} leave</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      </p>
                      <button
                        onClick={() => setShowLeaveReview(request.id)}
                        className="w-full bg-blue-50 text-blue-700 py-1 px-2 rounded text-xs font-medium hover:bg-blue-100 transition-colors"
                      >
                        Review Request
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending Progress Reports */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span>Progress Reports</span>
              </h3>
              {pendingReports > 0 && (
                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                  {pendingReports} pending
                </span>
              )}
            </div>
            
            {pendingReports === 0 ? (
              <div className="text-center py-6">
                <Award className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">All reports reviewed</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teamProgressReports.filter(r => !r.approved).slice(0, 3).map(report => {
                  const employee = teamMembers.find(u => u.id === report.userId);
                  const task = mockTasks.find(t => t.id === report.taskId);
                  return (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                      <div className="flex items-center space-x-2 mb-2">
                        <img
                          src={employee?.avatar}
                          alt={employee?.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{employee?.name}</p>
                          <p className="text-xs text-gray-600">{task?.title}</p>
                        </div>
                        <span className="text-xs font-medium text-purple-600">{report.progress}%</span>
                      </div>
                      <button
                        onClick={() => setShowProgressReview(report.id)}
                        className="w-full bg-purple-50 text-purple-700 py-1 px-2 rounded text-xs font-medium hover:bg-purple-100 transition-colors"
                      >
                        Review Progress
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Star className="w-5 h-5 text-blue-600" />
              <span>Quick Actions</span>
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowAddEmployee(true)}
                className="w-full bg-white text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center space-x-2 border border-gray-200"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Employee</span>
              </button>
              <button
                onClick={() => setShowCreateTask(true)}
                className="w-full bg-white text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center space-x-2 border border-gray-200"
              >
                <Plus className="w-4 h-4" />
                <span>Create Task</span>
              </button>
              <a
                href="/team-progress"
                className="w-full bg-white text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center space-x-2 border border-gray-200"
              >
                <BarChart3 className="w-4 h-4" />
                <span>View Team Analytics</span>
              </a>
              <a
                href="/projects"
                className="w-full bg-white text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center space-x-2 border border-gray-200"
              >
                <Briefcase className="w-4 h-4" />
                <span>Manage Projects</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateTask && <CreateTaskForm />}
      {showAddEmployee && (
        <AddEmployee
          onClose={() => setShowAddEmployee(false)}
          onSave={handleAddEmployee}
        />
      )}
      {showLeaveReview && <LeaveReviewModal requestId={showLeaveReview} />}
      {showProgressReview && <ProgressReviewModal reportId={showProgressReview} />}
    </div>
  );
};

export default ManagerDashboard;