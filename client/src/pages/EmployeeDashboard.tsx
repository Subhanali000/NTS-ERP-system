import React, { useState } from 'react';
import { Clock, Calendar, TrendingUp, CheckCircle, FileText, Send, Plus, Target, AlertCircle } from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import { mockTasks, mockLeaveRequests } from '../data/mockData';
import { formatDate, getDaysUntilDeadline, isOverdue } from '../utils/dateUtils';

const EmployeeDashboard: React.FC = () => {
  const user = getCurrentUser();
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showProgressForm, setShowProgressForm] = useState(false);

  const myTasks = mockTasks.filter(t => t.assigneeId === user.id);
  const myLeaveRequests = mockLeaveRequests.filter(lr => lr.userId === user.id);
  const completedTasks = myTasks.filter(t => t.status === 'completed');
  const inProgressTasks = myTasks.filter(t => t.status === 'in_progress');
  const overdueTasks = myTasks.filter(t => isOverdue(t.dueDate) && t.status !== 'completed');

  const LeaveApplicationForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Apply for Leave</h3>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="vacation">Vacation</option>
              <option value="sick">Sick Leave</option>
              <option value="personal">Personal</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Please provide a reason for your leave request..."
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Application
            </button>
            <button
              type="button"
              onClick={() => setShowLeaveForm(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const ProgressReportForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Progress Report</h3>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Task</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Choose a task...</option>
              {myTasks.map(task => (
                <option key={task.id} value={task.id}>{task.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Progress Percentage</label>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="50"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Progress Details</label>
            <textarea
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe what you've accomplished and any challenges faced..."
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Report</span>
            </button>
            <button
              type="button"
              onClick={() => setShowProgressForm(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
        <p className="text-gray-600 mt-1">Here's your personal dashboard overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">My Tasks</p>
              <p className="text-3xl font-bold mt-2">{myTasks.length}</p>
            </div>
            <Target className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Completed</p>
              <p className="text-3xl font-bold mt-2">{completedTasks.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">In Progress</p>
              <p className="text-3xl font-bold mt-2">{inProgressTasks.length}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Leave Balance</p>
              <p className="text-3xl font-bold mt-2">{user.leaveBalance}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowLeaveForm(true)}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
          >
            <Calendar className="w-6 h-6 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-medium text-gray-900">Apply for Leave</h4>
            <p className="text-sm text-gray-600">Submit a new leave request</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group">
            <Clock className="w-6 h-6 text-green-500 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-medium text-gray-900">Punch In/Out</h4>
            <p className="text-sm text-gray-600">Record your attendance</p>
          </button>
          <button
            onClick={() => setShowProgressForm(true)}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
          >
            <TrendingUp className="w-6 h-6 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-medium text-gray-900">Submit Progress</h4>
            <p className="text-sm text-gray-600">Update task progress</p>
          </button>
        </div>
      </div>

      {/* My Tasks Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">My Tasks</h3>
          <a href="/tasks" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All Tasks
          </a>
        </div>
        
        {myTasks.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No tasks assigned yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myTasks.slice(0, 5).map(task => {
              const daysUntil = getDaysUntilDeadline(task.dueDate);
              const overdue = isOverdue(task.dueDate);
              
              return (
                <div key={task.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className={`text-xs ${overdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                        {overdue ? `${Math.abs(daysUntil)} days overdue` : 
                         daysUntil === 0 ? 'Due today' :
                         daysUntil > 0 ? `${daysUntil} days left` : 'Completed'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${task.progressPct}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{task.progressPct}%</span>
                    {overdue && <AlertCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Leave Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Leave Requests</h3>
          <a href="/leave-management" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All Requests
          </a>
        </div>
        
        {myLeaveRequests.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No leave requests yet</p>
            <button
              onClick={() => setShowLeaveForm(true)}
              className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              Apply for leave
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {myLeaveRequests.slice(0, 3).map(request => (
              <div key={request.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 capitalize">
                    {request.type.replace('_', ' ')} Leave
                  </h4>
                  <p className="text-sm text-gray-600">
                    {formatDate(request.startDate)} - {formatDate(request.endDate)}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  request.status === 'approved' ? 'bg-green-100 text-green-800' :
                  request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showLeaveForm && <LeaveApplicationForm />}
      {showProgressForm && <ProgressReportForm />}
    </div>
  );
};

export default EmployeeDashboard;