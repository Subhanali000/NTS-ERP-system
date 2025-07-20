import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users, ClipboardList, Calendar, TrendingUp, CheckCircle, Briefcase, BarChart3,
  Plus, Clock, AlertTriangle, MessageSquare, Award, Star, UserPlus
} from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import { formatDate, getDaysUntilDeadline, isOverdue, getRelativeDate } from '../utils/dateUtils';
import AddEmployee from '../components/Manager/AddEmployee';

interface LeaveReviewModalProps {
  requestId: string;
  leaveRequests: any[];
  teamMembers: any[];
  onApprove: (id: string, approved: boolean) => void;
  onClose: () => void;
}
interface ProgressReviewModalProps {
  reportId: string;
  reports: any[];
  tasks: any[];
  employees: any[];
  onApprove: (reportId: string, approved: boolean, comments: string) => void;
  onClose: () => void;
}
const ManagerDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [progressReports, setProgressReports] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showLeaveReview, setShowLeaveReview] = useState<string | null>(null);
  const [showProgressReview, setShowProgressReview] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = getCurrentUser();
        setUser(currentUser);

        const [teamRes, tasksRes, leavesRes, reportsRes, projectsRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/users/team?managerId=${currentUser.id}`),
          axios.get(`http://localhost:8000/api/tasks?managerId=${currentUser.id}`),
          axios.get(`http://localhost:8000/api/leaves?managerId=${currentUser.id}`),
          axios.get(`http://localhost:8000/api/reports?managerId=${currentUser.id}`),
          axios.get(`http://localhost:8000/api/projects?managerId=${currentUser.id}`)
        ]);

        setTeamMembers(teamRes.data);
        setTasks(tasksRes.data);
        setLeaveRequests(leavesRes.data);
        setProgressReports(reportsRes.data);
        setProjects(projectsRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  const handleLeaveApproval = async (requestId: string, approved: boolean) => {
    try {
      await axios.post(`http://localhost:8000/api/leaves/${requestId}/review`, { approved });
      setLeaveRequests(prev =>
        prev.map(lr => (lr.id === requestId ? { ...lr, status: approved ? 'approved' : 'rejected' } : lr))
      );
    } catch (err) {
      console.error('Leave approval error:', err);
    }
    setShowLeaveReview(null);
  };

  const handleProgressApproval = async (reportId: string, approved: boolean, comments?: string) => {
    try {
      await axios.post(`http://localhost:8000/api/reports/${reportId}/review`, { approved, comments });
      setProgressReports(prev =>
        prev.map(r => (r.id === reportId ? { ...r, approved } : r))
      );
    } catch (err) {
      console.error('Progress approval error:', err);
    }
    setShowProgressReview(null);
  };

  const handleAddEmployee = async (newEmployee: any) => {
    try {
      const res = await axios.post(`http://localhost:8000/api/users`, newEmployee);
      setTeamMembers(prev => [...prev, res.data]);
    } catch (error) {
      console.error('Error adding employee:', error);
    }
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
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                <option value="">Select project...</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assignee *</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2" required>
                <option value="">Select team member...</option>
                {teamMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2" required>
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowCreateTask(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (!user) return <div>Loading...</div>;
  const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({
  requestId,
  leaveRequests,
  teamMembers,
  onApprove,
  onClose,
}) => {
  const request = leaveRequests.find(r => r.id === requestId);
  const requester = teamMembers.find(u => u.id === request?.userId);

  if (!request || !requester) return null;
  const handleLeaveApproval = (id: string, approved: boolean) => {
    onApprove(id, approved);  
    onClose();
  };
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
  
const ProgressReviewModal: React.FC<ProgressReviewModalProps> = ({
  reportId,
  reports,
  tasks,
  employees,
  onApprove,
  onClose,
}) => {
  const report = reports.find(r => r.id === reportId);
  const task = tasks.find(t => t.id === report?.taskId);
  const employee = employees.find(e => e.id === report?.userId);

  const [comments, setComments] = useState('');

    if (!report || !task || !employee) return null;
  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'global_hr_director': 'Global HR Director',
      'global_operations_director': 'Global Operations Director',
      'engineering_director': 'Engineering Director',
      'director_tech_team': 'Director, Tech Team',
      'director_business_development': 'Director, Business Development',
      'talent_acquisition_manager': 'Talent Acquisition Manager',
      'project_tech_manager': 'Project Tech Manager',
      'quality_assurance_manager': 'Quality Assurance Manager',
      'software_development_manager': 'Software Development Manager',
      'systems_integration_manager': 'Systems Integration Manager',
      'client_relations_manager': 'Client Relations Manager',
      'team_lead': 'Team Lead',
      'employee': 'Employee',
      'intern': 'Intern'
    };
    return roleMap[role] || role;
  }

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
            onClick={() => onApprove(report.id, true, comments)}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Approve</span>
          </button>
          <button
            onClick={() => onApprove(report.id, false, comments)}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Request Changes</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

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
    {teamTasks.slice(0, 5).map((task) => {
      const assignee = teamMembers.find((u) => u.id === task.assigneeId);
      const daysUntil = getDaysUntilDeadline(task.dueDate);
      const overdue = isOverdue(task.dueDate);

      const dueText = overdue
        ? `${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''} overdue`
        : daysUntil === 0
        ? 'Due today'
        : `${daysUntil} day${daysUntil !== 1 ? 's' : ''} left`;

      return (
        <div
          key={task.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {/* Left side: task info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-1">
              <h4 className="font-medium text-gray-900">{task.title}</h4>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                  task.priority
                )}`}
              >
                {task.priority}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                {assignee?.avatar && (
                  <img
                    src={assignee.avatar}
                    alt={assignee.name}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                )}
                <span>{assignee?.name || 'Unassigned'}</span>
              </div>
              <span className={overdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                {dueText}
              </span>
            </div>
          </div>

          {/* Right side: status and progress */}
          <div className="flex items-center space-x-3 ml-4">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                task.status
              )}`}
            >
              {task.status.replace('_', ' ')}
            </span>
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${task.progressPct}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-8 text-right">
              {task.progressPct}%
            </span>
          </div>
        </div>
      );
    })}

 {/* No tasks message */}
{teamTasks.length === 0 ? (
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
) : (
  <div>
    {/* Render your task list here */}
  </div>
)}

{/* Render Modals outside conditional blocks */}
{showCreateTask && <CreateTaskForm />}
{showAddEmployee && (
  <AddEmployee onAdd={handleAddEmployee} onClose={() => setShowAddEmployee(false)} />
)}
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
    {teamProgressReports
      .filter(r => !r.approved)
      .slice(0, 3)
      .map(report => {
        const employee = teamMembers.find(u => u.id === report.userId);
        const task = assignedTasks.find(t => t.id === report.taskId); // ✅ Use actual tasks data

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
                <p className="text-xs text-gray-600">{task?.title || 'Unknown Task'}</p>
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
      return(
          
       {/* Modals */}
      {showProgressReview && (
        <ProgressReviewModal
          reportId={showProgressReview}
          reports={progressReports}
          tasks={assignedTasks}
          employees={teamMembers}
          onApprove={handleProgressApproval}
          onClose={() => setShowProgressReview(null)}
        />
      )}

      {showLeaveReview && (
        <LeaveReviewModal
          requestId={showLeaveReview}
          leaveRequests={leaveRequests}
          teamMembers={teamMembers}
          onApprove={handleLeaveApproval}
          onClose={() => setShowLeaveReview(null)}
        />
      )}

      {showCreateTask && (
        <CreateTaskForm
          onClose={() => setShowCreateTask(false)}
          onSave={handleCreateTask}
        />
      )}

      {showAddEmployee && (
        <AddEmployee
          onClose={() => setShowAddEmployee(false)}
          onSave={handleAddEmployee}
        />
      )}
    </div>
};
export default ManagerDashboard;