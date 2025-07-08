import React, { useState, useEffect } from 'react';
import { Plus, Users, Calendar, TrendingUp, Briefcase, Edit, Trash2, Eye, Filter, Search, CheckCircle, Clock, AlertTriangle, MessageSquare, Send, X } from 'lucide-react';
import { getCurrentUser, isDirector, isManager } from '../utils/auth';
import { formatDate, getDaysUntilDeadline, isOverdue } from '../utils/dateUtils';
import { getRoleDisplayName } from '../utils/auth';
import axios from 'axios';

const Projects: React.FC = () => {
  const user = getCurrentUser();
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [approvalComments, setApprovalComments] = useState('');
  const [managers, setManagers] = useState<any[]>([]); // Default to empty array
  const [employees, setEmployees] = useState<any[]>([]); // Default to empty array
  const [loading, setLoading] = useState(true);
  const [showAssignEmployees, setShowAssignEmployees] = useState<string | null>(null); // Track project for assignment

  const canManageProjects = isDirector(user.role) || isManager(user.role);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const projectsRes = await axios.get('http://localhost:8000/api/director/active-projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(projectsRes.data.active_projects || []);

        const managersRes = await axios.get('http://localhost:8000/api/director/managers', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setManagers(Array.isArray(managersRes.data) ? managersRes.data : managersRes.data?.data || []);

        const employeesRes = await axios.get('http://localhost:8000/api/director/employees', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(Array.isArray(employeesRes.data) ? employeesRes.data : employeesRes.data?.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setManagers([]);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const userProjects = canManageProjects
    ? projects.filter(p => p.manager_id === user.id || isDirector(user.role))
    : projects.filter(p => p.team_members?.includes(user.id) || p.manager_id === user.id);

  const filteredProjects = userProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingApprovals = isDirector(user.role)
    ? projects.filter(p => p.status === 'planning' && managers.find(m => m.id === p.manager_id)?.director_id === user.id)
    : [];

  const handleCreateProject = async (projectData: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await axios.post('http://localhost:8000/api/director/create-project', {
        title: projectData.title,
        description: projectData.description,
        start_date: projectData.startDate,
        end_date: projectData.endDate,
        manager_id: isManager(user.role) ? user.id : projectData.managerId,
        team_members: projectData.teamMembers,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProjects(prev => [...prev, response.data.project]);
      setShowCreateProject(false);
      console.log('Project created successfully');
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleProjectApproval = async (projectId: string, approved: boolean, comments?: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      await axios.post('http://localhost:8000/api/director/assign-employee', {
        project_id: projectId,
        employee_id: managers.find(m => m.id === projects.find(p => p.id === projectId)?.manager_id)?.id,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProjects(prev => prev.map(project =>
        project.id === projectId ? { ...project, status: approved ? 'active' : 'rejected' } : project
      ));
      setShowApprovalModal(false);
      setSelectedProject(null);
      setApprovalComments('');
      console.log(`Project ${approved ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error approving project:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        await axios.delete(`/api/director/users/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProjects(prev => prev.filter(p => p.id !== projectId));
        console.log('Project deleted successfully');
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleAssignEmployees = async (projectId: string, employeeIds: string[]) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      await axios.post('http://localhost:8000/api/manager/assign-employees', {
        project_id: projectId,
        employee_ids: employeeIds,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProjects(prev => prev.map(project =>
        project.id === projectId ? { ...project, team_members: employeeIds } : project
      ));
      setShowAssignEmployees(null);
      console.log('Employees assigned successfully');
    } catch (error) {
      console.error('Error assigning employees:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'planning': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const CreateProjectForm = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      managerId: isDirector(user.role) ? '' : user.id,
      startDate: '',
      endDate: '',
      teamMembers: [] as string[],
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const availableManagers = isDirector(user.role) ? managers : [];
    const availableEmployees = isDirector(user.role) ? employees : employees.filter(e => e.manager_id === user.id);

    const validateForm = () => {
      const newErrors: Record<string, string> = {};
      
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (!formData.startDate) newErrors.startDate = 'Start date is required';
      if (!formData.endDate) newErrors.endDate = 'End date is required';
      if (isDirector(user.role) && !formData.managerId) newErrors.managerId = 'Manager is required';
      
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
        handleCreateProject(formData);
      }
    };

    const toggleTeamMember = (userId: string) => {
      setFormData(prev => ({
        ...prev,
        teamMembers: prev.teamMembers.includes(userId)
          ? prev.teamMembers.filter(id => id !== userId)
          : [...prev.teamMembers, userId],
      }));
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Create New Project</h2>
            <p className="text-gray-600 mt-1">Set up a new project and assign team members</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Briefcase className="w-5 h-5" />
                  <span>Project Details</span>
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter project title"
                  />
                  {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Describe the project objectives and scope"
                  />
                  {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                </div>

                {isDirector(user.role) && availableManagers.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Manager *</label>
                    <select
                      value={formData.managerId}
                      onChange={(e) => setFormData(prev => ({ ...prev, managerId: e.target.value }))}
                      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.managerId ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a manager</option>
                      {availableManagers.map(manager => (
                        <option key={manager.id} value={manager.id}>
                          {manager.name} - {getRoleDisplayName(manager.role)}
                        </option>
                      ))}
                    </select>
                    {errors.managerId && <p className="text-red-600 text-sm mt-1">{errors.managerId}</p>}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
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
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>
                    {isDirector(user.role) ? 'Assign Managers' : 'Team Members'}
                  </span>
                </h3>

                <div className="border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <div className="space-y-3">
                    {isDirector(user.role) ? (
                      availableManagers.length > 0 ? (
                        availableManagers.map(manager => (
                          <div key={manager.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              checked={formData.teamMembers.includes(manager.id)}
                              onChange={() => toggleTeamMember(manager.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <img
                              src={manager.avatar}
                              alt={manager.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{manager.name}</p>
                              <p className="text-sm text-gray-600">{getRoleDisplayName(manager.role)}</p>
                              <p className="text-xs text-gray-500 capitalize">{manager.department.replace('_', ' ')}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No managers available.</p>
                      )
                    ) : (
                      availableEmployees.length > 0 ? (
                        availableEmployees.map(employee => (
                          <div key={employee.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              checked={formData.teamMembers.includes(employee.id)}
                              onChange={() => toggleTeamMember(employee.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <img
                              src={employee.avatar}
                              alt={employee.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{employee.name}</p>
                              <p className="text-sm text-gray-600">{getRoleDisplayName(employee.role)}</p>
                              <p className="text-xs text-gray-500 capitalize">{employee.department.replace('_', ' ')}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No team members available.</p>
                      )
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>{formData.teamMembers.length}</strong> {isDirector(user.role) ? 'managers' : 'team members'} selected
                  </p>
                  {isDirector(user.role) && (
                    <p className="text-xs text-blue-600 mt-1">
                      As a director, you can only assign projects to managers who will then manage their teams.
                    </p>
                  )}
                  {isManager(user.role) && !isDirector(user.role) && (
                    <p className="text-xs text-blue-600 mt-1">
                      This project will be submitted for director approval before becoming active.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowCreateProject(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Project</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const AssignEmployeesForm = ({ projectId }: { projectId: string }) => {
    const project = projects.find(p => p.id === projectId);
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>(project?.team_members || []);

    const availableEmployees = employees.filter(e => e.manager_id === user.id);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedEmployees.length > 0) {
        handleAssignEmployees(projectId, selectedEmployees);
      }
    };

    const toggleEmployee = (employeeId: string) => {
      setSelectedEmployees(prev =>
        prev.includes(employeeId) ? prev.filter(id => id !== employeeId) : [...prev, employeeId]
      );
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Assign Employees to {project?.title}</h2>
            <p className="text-gray-600 mt-1">Select employees to assign to this project</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {availableEmployees.length > 0 ? (
                    availableEmployees.map(employee => (
                      <div key={employee.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(employee.id)}
                          onChange={() => toggleEmployee(employee.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <img
                          src={employee.avatar}
                          alt={employee.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{employee.name}</p>
                          <p className="text-sm text-gray-600">{getRoleDisplayName(employee.role)}</p>
                          <p className="text-xs text-gray-500 capitalize">{employee.department.replace('_', ' ')}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No employees available to assign.</p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>{selectedEmployees.length}</strong> employees selected
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowAssignEmployees(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>Assign Employees</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ProjectApprovalModal = ({ projectId }: { projectId: string }) => {
    const project = projects.find(p => p.id === projectId);
    const manager = managers.find(u => u.id === project?.manager_id);
    
    if (!project || !manager) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Review Project Proposal</h3>
            <p className="text-gray-600 mt-1">Approve or reject this project proposal</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">{project.title}</h4>
              <p className="text-gray-700 mb-4">{project.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Project Manager:</span>
                  <span className="ml-2 font-medium text-gray-900">{manager.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Department:</span>
                  <span className="ml-2 font-medium text-gray-900 capitalize">{manager.department.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-gray-600">Start Date:</span>
                  <span className="ml-2 font-medium text-gray-900">{formatDate(project.start_date)}</span>
                </div>
                <div>
                  <span className="text-gray-600">End Date:</span>
                  <span className="ml-2 font-medium text-gray-900">{formatDate(project.end_date)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Team Size:</span>
                  <span className="ml-2 font-medium text-gray-900">{project.team_members?.length || 0} members</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
              <img
                src={manager.avatar}
                alt={manager.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900">{manager.name}</p>
                <p className="text-sm text-gray-600">{getRoleDisplayName(manager.role)}</p>
                <p className="text-xs text-gray-500">{manager.department.replace('_', ' ').toUpperCase()}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments (Optional)
              </label>
              <textarea
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any comments for the project manager..."
              />
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex space-x-3">
            <button
              onClick={() => handleProjectApproval(project.id, true, approvalComments)}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Approve Project</span>
            </button>
            <button
              onClick={() => handleProjectApproval(project.id, false, approvalComments)}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <X className="w-5 h-5" />
              <span>Reject Project</span>
            </button>
            <button
              onClick={() => {
                setShowApprovalModal(false);
                setSelectedProject(null);
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

  const ProjectCard = ({ project }: { project: any }) => {
    const manager = managers.find(u => u.id === project.manager_id);
    const teamMembers = employees.filter(u => project.team_members?.includes(u.id));
    const daysUntil = getDaysUntilDeadline(project.end_date);
    const overdue = isOverdue(project.end_date);

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                {project.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-3">{project.description}</p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(project.start_date)} - {formatDate(project.end_date)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span className={overdue ? 'text-red-600 font-medium' : ''}>
                  {overdue ? `${Math.abs(daysUntil)} days overdue` : 
                   daysUntil === 0 ? 'Due today' :
                   daysUntil > 0 ? `${daysUntil} days left` : 'Completed'}
                </span>
              </div>
            </div>
          </div>
          
          {canManageProjects && (
            <div className="flex items-center space-x-2">
              {project.status === 'planning' && isDirector(user.role) && (
                <button 
                  onClick={() => {
                    setSelectedProject(project.id);
                    setShowApprovalModal(true);
                  }}
                  className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                  title="Review Project"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              )}
              {isManager(user.role) && project.manager_id === user.id && project.status === 'active' && (
                <button
                  onClick={() => setShowAssignEmployees(project.id)}
                  className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                  title="Assign Employees"
                >
                  <Users className="w-4 h-4" />
                </button>
              )}
              <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                <Eye className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors">
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDeleteProject(project.id)}
                className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-600">{project.progress || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress || 0)}`}
              style={{ width: `${project.progress || 0}%` }}
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
          <img
            src={manager?.avatar}
            alt={manager?.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">{manager?.name}</p>
            <p className="text-xs text-gray-600">Project Manager</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {teamMembers.slice(0, 4).map(member => (
                <img
                  key={member.id}
                  src={member.avatar}
                  alt={member.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white"
                  title={member.name}
                />
              ))}
              {teamMembers.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">+{teamMembers.length - 4}</span>
                </div>
              )}
            </div>
            <span className="text-sm text-gray-600">
              {teamMembers.length} {isDirector(user.role) ? 'managers' : 'members'}
            </span>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-600">{teamMembers.length} tasks</p>
            <p className="text-xs text-gray-500">completed</p>
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
            {isDirector(user.role) ? 'Project Approvals' : canManageProjects ? 'Project Management' : 'My Projects'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isDirector(user.role) 
              ? 'Review and approve project proposals from managers'
              : canManageProjects 
                ? 'Create and manage projects, assign teams, and track progress'
                : 'View your assigned projects and track progress'
            }
          </p>
        </div>
        {canManageProjects && (
          <button
            onClick={() => setShowCreateProject(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Projects</p>
              <p className="text-3xl font-bold mt-2">{userProjects.length}</p>
            </div>
            <Briefcase className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Active</p>
              <p className="text-3xl font-bold mt-2">{userProjects.filter(p => p.status === 'active').length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">
                {isDirector(user.role) ? 'Pending Approval' : 'Planning'}
              </p>
              <p className="text-3xl font-bold mt-2">
                {isDirector(user.role) ? pendingApprovals.length : userProjects.filter(p => p.status === 'planning').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Completed</p>
              <p className="text-3xl font-bold mt-2">{userProjects.filter(p => p.status === 'completed').length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {isDirector(user.role) && pendingApprovals.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span>Pending Project Approvals ({pendingApprovals.length})</span>
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingApprovals.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="planning">Planning</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? <p>Loading...</p> : filteredProjects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {filteredProjects.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter 
              ? 'Try adjusting your search criteria.' 
              : canManageProjects 
                ? 'Create your first project to get started.'
                : 'No projects have been assigned to you yet.'
            }
          </p>
          {canManageProjects && (
            <button
              onClick={() => setShowCreateProject(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Project
            </button>
          )}
        </div>
      )}

      {showCreateProject && <CreateProjectForm />}
      {showApprovalModal && selectedProject && <ProjectApprovalModal projectId={selectedProject} />}
      {showAssignEmployees && <AssignEmployeesForm projectId={showAssignEmployees} />}
    </div>
  );
};

export default Projects;