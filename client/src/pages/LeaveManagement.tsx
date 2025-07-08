import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Plus, Filter, User, Send, MessageSquare, AlertTriangle, FileText } from 'lucide-react';
import { getCurrentUser, canApproveLeave, isDirector, isManager } from '../utils/auth';
import { mockLeaveRequests, mockUsers } from '../data/mockData';
import { formatDate, getRelativeDate } from '../utils/dateUtils';

const LeaveManagement: React.FC = () => {
  const user = getCurrentUser();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState(mockLeaveRequests);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [approvalComments, setApprovalComments] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  const isDir = isDirector(user.role);
  const isMgr = isManager(user.role);
  const canApprove = isDir || isMgr;

  const myRequests = leaveRequests.filter(lr => lr.userId === user.id);
  
  // Directors approve manager leaves, Managers approve employee/intern leaves
  const pendingApprovals = leaveRequests.filter(lr => {
    if (lr.status !== 'pending') return false;
    
    const requester = mockUsers.find(u => u.id === lr.userId);
    if (!requester) return false;

    if (isDir) {
      // Directors approve manager leaves
      return isManager(requester.role) && requester.managerId === user.id;
    } else if (isMgr) {
      // Managers approve employee/intern leaves
      return (requester.role === 'employee' || requester.role === 'intern') && requester.managerId === user.id;
    }
    
    return false;
  });

  const handleApproval = (requestId: string, approved: boolean, comments?: string) => {
    setLeaveRequests(prev => prev.map(request => {
      if (request.id === requestId) {
        return {
          ...request,
          status: approved ? 'approved' : 'rejected',
          approverChain: request.approverChain.map(step => 
            step.approverId === user.id 
              ? { ...step, status: approved ? 'approved' : 'rejected', timestamp: new Date().toISOString(), comments }
              : step
          )
        };
      }
      return request;
    }));
    
    setSelectedRequest(null);
    setApprovalComments('');
    
    // Show success notification
    const action = approved ? 'approved' : 'rejected';
    console.log(`Leave request ${action} successfully`);
  };

  const handleLeaveSubmission = (formData: any) => {
    const newRequest = {
      id: `leave-${Date.now()}`,
      userId: user.id,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      type: formData.type,
      status: 'pending' as const,
      approverChain: [
        { approverId: user.managerId || '', status: 'pending' as const }
      ],
      createdAt: new Date().toISOString()
    };

    setLeaveRequests(prev => [...prev, newRequest]);
    setShowRequestForm(false);
    console.log('Leave request submitted successfully');
  };

  const filteredRequests = (requests: any[]) => {
    return requests.filter(request => {
      const matchesStatus = !filterStatus || request.status === filterStatus;
      const matchesType = !filterType || request.type === filterType;
      return matchesStatus && matchesType;
    });
  };

  const LeaveRequestForm = () => {
    const [formData, setFormData] = useState({
      type: 'vacation',
      startDate: '',
      endDate: '',
      reason: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
      const newErrors: Record<string, string> = {};
      
      if (!formData.startDate) newErrors.startDate = 'Start date is required';
      if (!formData.endDate) newErrors.endDate = 'End date is required';
      if (!formData.reason.trim()) newErrors.reason = 'Reason is required';
      
      if (formData.startDate && formData.endDate) {
        if (new Date(formData.startDate) > new Date(formData.endDate)) {
          newErrors.endDate = 'End date must be after start date';
        }
        if (new Date(formData.startDate) < new Date()) {
          newErrors.startDate = 'Start date cannot be in the past';
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (validateForm()) {
        handleLeaveSubmission(formData);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Request Leave</h3>
            <p className="text-gray-600 mt-1">Submit a new leave request for approval</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type *</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="vacation">Vacation</option>
                <option value="sick">Sick Leave</option>
                <option value="personal">Personal</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.startDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.startDate && <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.endDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.endDate && <p className="text-red-600 text-sm mt-1">{errors.endDate}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
              <textarea
                rows={3}
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.reason ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Please provide a reason for your leave request..."
              />
              {errors.reason && <p className="text-red-600 text-sm mt-1">{errors.reason}</p>}
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Request</span>
              </button>
              <button
                type="button"
                onClick={() => setShowRequestForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ApprovalModal = ({ requestId }: { requestId: string }) => {
    const request = leaveRequests.find(r => r.id === requestId);
    const requester = mockUsers.find(u => u.id === request?.userId);
    
    if (!request || !requester) return null;

    const daysDifference = Math.ceil((new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / (1000 * 3600 * 24)) + 1;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Review Leave Request</h3>
            <p className="text-gray-600 mt-1">Approve or reject this leave request</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Employee Info */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <img
                src={requester.avatar}
                alt={requester.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900">{requester.name}</p>
                <p className="text-sm text-gray-600">{requester.role.replace('_', ' ').toUpperCase()}</p>
                <p className="text-xs text-gray-500">{requester.department.replace('_', ' ').toUpperCase()}</p>
              </div>
            </div>

            {/* Leave Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Leave Type</p>
                <p className="text-lg font-semibold text-blue-900 capitalize">{request.type.replace('_', ' ')}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Duration</p>
                <p className="text-lg font-semibold text-green-900">{daysDifference} day{daysDifference > 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 font-medium mb-2">Dates</p>
              <p className="text-gray-900">{formatDate(request.startDate)} - {formatDate(request.endDate)}</p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-600 font-medium mb-2">Reason</p>
              <p className="text-gray-900">{request.reason}</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 font-medium mb-2">Submitted</p>
              <p className="text-gray-900">{getRelativeDate(request.createdAt)}</p>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments (Optional)
              </label>
              <textarea
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any comments for the employee..."
              />
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex space-x-3">
            <button
              onClick={() => handleApproval(request.id, true, approvalComments)}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Approve</span>
            </button>
            <button
              onClick={() => handleApproval(request.id, false, approvalComments)}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <XCircle className="w-5 h-5" />
              <span>Reject</span>
            </button>
            <button
              onClick={() => {
                setSelectedRequest(null);
                setApprovalComments('');
              }}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isDir ? 'Manager Leave Approvals' : 
             isMgr ? 'Employee Leave Management' : 
             'Leave Requests'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isDir ? 'Approve leave requests from managers' :
             isMgr ? 'Approve employee and intern leave requests' :
             'Request and track your leave applications'}
          </p>
        </div>
        {!canApprove && (
          <button
            onClick={() => setShowRequestForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Request Leave</span>
          </button>
        )}
      </div>

      {/* Leave Balance Card - Only for employees */}
      {!canApprove && (
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Leave Balance</h2>
              <p className="text-green-100">Available days for this year</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{user.leaveBalance}</div>
              <p className="text-green-100">days remaining</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards for Approvers */}
      {canApprove && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-900">{pendingApprovals.length}</p>
                <p className="text-sm text-yellow-700">Pending Approval</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900">
                  {leaveRequests.filter(r => r.status === 'approved').length}
                </p>
                <p className="text-sm text-green-700">Approved</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-900">
                  {leaveRequests.filter(r => r.status === 'rejected').length}
                </p>
                <p className="text-sm text-red-700">Rejected</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">{leaveRequests.length}</p>
                <p className="text-sm text-blue-700">Total Requests</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">Filters:</span>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="vacation">Vacation</option>
            <option value="sick">Sick Leave</option>
            <option value="personal">Personal</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Show tabs only for non-directors or if director has personal requests */}
        {(!isDir || myRequests.length > 0) && (
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {!isDir && (
                <div className="py-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm">
                  {canApprove ? 'My Leave Requests' : 'My Requests'} ({filteredRequests(myRequests).length})
                </div>
              )}
              {canApprove && (
                <div className="py-4 px-1 border-b-2 border-transparent text-gray-500 font-medium text-sm">
                  {isDir ? 'Manager Approvals' : 'Employee Approvals'} ({filteredRequests(pendingApprovals).length})
                </div>
              )}
            </nav>
          </div>
        )}

        <div className="p-6">
          {/* For Directors: Show only pending approvals */}
          {isDir ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Manager Leave Approvals</h3>
              {filteredRequests(pendingApprovals).length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No pending manager leave requests to review</p>
                </div>
              ) : (
                filteredRequests(pendingApprovals).map((request) => {
                  const requester = mockUsers.find(u => u.id === request.userId);
                  const daysDifference = Math.ceil((new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / (1000 * 3600 * 24)) + 1;
                  
                  return (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <img
                              src={requester?.avatar}
                              alt={requester?.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <h3 className="font-medium text-gray-900">{requester?.name}</h3>
                              <p className="text-sm text-gray-600 capitalize">
                                {requester?.role.replace('_', ' ')} • {request.type.replace('_', ' ')} Leave
                              </p>
                            </div>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                              {daysDifference} day{daysDifference > 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="ml-13">
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Duration:</strong> {formatDate(request.startDate)} - {formatDate(request.endDate)}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Reason:</strong> {request.reason}
                            </p>
                            <p className="text-xs text-gray-500">
                              Requested {getRelativeDate(request.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedRequest(request.id)}
                            className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>Review</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* For Managers and Employees: Show both sections */
            <div className="space-y-6">
              {/* My Requests Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {canApprove ? 'My Leave Requests' : 'My Requests'}
                </h3>
                <div className="space-y-4">
                  {filteredRequests(myRequests).length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No leave requests found</p>
                      {!canApprove && (
                        <button
                          onClick={() => setShowRequestForm(true)}
                          className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Create your first request
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredRequests(myRequests).map((request) => {
                      const daysDifference = Math.ceil((new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / (1000 * 3600 * 24)) + 1;
                      
                      return (
                        <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h3 className="font-medium text-gray-900 capitalize">
                                  {request.type.replace('_', ' ')} Leave
                                </h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {request.status}
                                </span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                  {daysDifference} day{daysDifference > 1 ? 's' : ''}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {formatDate(request.startDate)} - {formatDate(request.endDate)}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">{request.reason}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                Requested {getRelativeDate(request.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Approvals Section for Managers */}
              {canApprove && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {isMgr ? 'Employee Approvals' : 'Approvals'}
                  </h3>
                  <div className="space-y-4">
                    {filteredRequests(pendingApprovals).length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No pending approvals</p>
                        <p className="text-sm text-gray-400 mt-1">
                          No employee leave requests to review
                        </p>
                      </div>
                    ) : (
                      filteredRequests(pendingApprovals).map((request) => {
                        const requester = mockUsers.find(u => u.id === request.userId);
                        const daysDifference = Math.ceil((new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / (1000 * 3600 * 24)) + 1;
                        
                        return (
                          <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <img
                                    src={requester?.avatar}
                                    alt={requester?.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                  <div>
                                    <h3 className="font-medium text-gray-900">{requester?.name}</h3>
                                    <p className="text-sm text-gray-600 capitalize">
                                      {requester?.role.replace('_', ' ')} • {request.type.replace('_', ' ')} Leave
                                    </p>
                                  </div>
                                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                    {daysDifference} day{daysDifference > 1 ? 's' : ''}
                                  </span>
                                </div>
                                <div className="ml-13">
                                  <p className="text-sm text-gray-600 mb-1">
                                    <strong>Duration:</strong> {formatDate(request.startDate)} - {formatDate(request.endDate)}
                                  </p>
                                  <p className="text-sm text-gray-600 mb-2">
                                    <strong>Reason:</strong> {request.reason}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Requested {getRelativeDate(request.createdAt)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setSelectedRequest(request.id)}
                                  className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                  <span>Review</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showRequestForm && <LeaveRequestForm />}
      {selectedRequest && <ApprovalModal requestId={selectedRequest} />}
    </div>
  );
};

export default LeaveManagement;