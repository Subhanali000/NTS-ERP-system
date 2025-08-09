import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  ClipboardList,
  Calendar,
  TrendingUp,
  CheckCircle,
  Briefcase,
  BarChart3,
  Plus,
  Clock,
  AlertTriangle,
  MessageSquare,
  Award,
  Star,
  UserPlus,
  X,
} from "lucide-react";
import { getCurrentUser, getRoleDisplayName } from "../utils/auth";
import {
  formatDate,
  getDaysUntilDeadline,
  isOverdue,
  getRelativeDate,
} from "../utils/dateUtils";
import { getPriorityColor, getStatusColor } from "../utils/colors";
import AddEmployee from "../components/Manager/AddEmployee";
import { LeaveRequest, ProgressReport, Task, User, Project } from "../types";

interface LeaveReviewModalProps {
  requestId: string;
  leaveRequests: LeaveRequest[];
  teamMembers: User[];
  onApprove: (id: string, approved: boolean) => void;
  onClose: () => void;
}

interface ProgressReviewModalProps {
  reportId: string;
  reports: ProgressReport[];
  tasks: Task[];
  employees: User[];
  onApprove: (reportId: string, approved: boolean, comments: string) => void;
  onClose: () => void;
}

interface CreateTaskFormProps {
  onClose: () => void;
  onSave: (task: {
    title: string;
    description: string;
    projectId: string;
    assigneeId: string;
    priority: string;
    dueDate: string;
  }) => void;
  teamMembers: User[];
  projects: Project[];
}

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({
  onClose,
  onSave,
  teamMembers,
  projects,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !projectId || !assigneeId || !dueDate) {
      alert("Please fill in all required fields.");
      return;
    }

    onSave({ title, description, projectId, assigneeId, priority, dueDate });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Create New Task
            </h3>
            <p className="text-gray-600 mt-1">
              Assign a new task to your team member
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form className="p-6 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter task title..."
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the task requirements and objectives..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project *
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="">Select project...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignee *
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="">Select team member...</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
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
};

const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({
  requestId,
  leaveRequests,
  teamMembers,
  onApprove,
  onClose,
}) => {
  const request = leaveRequests.find((r) => r.id === requestId);
  const requester = teamMembers.find((u) => u.id === request?.userId);

  if (!request || !requester) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Review Leave Request
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-3">
            <img
              src={requester.avatar}
              alt={requester.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-medium text-gray-900">{requester.name}</p>
              <p className="text-sm text-gray-600">
                {getRoleDisplayName(requester.role)}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Type</p>
                <p className="font-medium capitalize">
                  {request.type.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Duration</p>
                <p className="font-medium">
                  {formatDate(request.startDate)} -{" "}
                  {formatDate(request.endDate)}
                </p>
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
            onClick={() => onApprove(request.id, true)}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Approve</span>
          </button>
          <button
            onClick={() => onApprove(request.id, false)}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Reject</span>
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
  const report = reports.find((r) => r.id === reportId);
  const task = tasks.find((t) => t.id === report?.taskId);
  const employee = employees.find((e) => e.id === report?.userId);

  const [comments, setComments] = useState("");

  if (!report || !task || !employee) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Review Progress Report
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 mb-6">
          <div className="flex items-center space-x-3">
            <img
              src={employee.avatar}
              alt={employee.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-gray-900">{employee.name}</p>
              <p className="text-sm text-gray-600">
                {getRoleDisplayName(employee.role)}
              </p>
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
                <span className="text-sm font-medium text-gray-700">
                  {report.progress}%
                </span>
              </div>
              <span className="text-xs text-gray-500">
                Updated {getRelativeDate(report.timestamp)}
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              Employee Comments
            </h4>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-gray-700">{report.comments}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Manager Feedback
            </label>
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
        </div>
      </div>
    </div>
  );
};

const ManagerDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [progressReports, setProgressReports] = useState<ProgressReport[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [teams, setTeams] = useState<any[]>([]);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showLeaveReview, setShowLeaveReview] = useState<string | null>(null);
  const [showProgressReview, setShowProgressReview] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const currentUser = getCurrentUser();
        setUser(currentUser);

        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found");
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };

        const [teamRes, tasksRes, leavesRes, reportsRes, projectsRes, teamsRes] =
  await Promise.all([
    axios.get("http://localhost:8000/api/manager/users/team", config),
    axios.get("http://localhost:8000/api/manager/tasks", config),
    axios.get("http://localhost:8000/api/manager/leaves", config),
    axios.get("http://localhost:8000/api/manager/reports", config),
    axios.get("http://localhost:8000/api/manager/active-projects", config),
    axios.get("http://localhost:8000/api/manager/teams", config),
  ]);
        if (
          !Array.isArray(teamRes.data) ||
          !Array.isArray(tasksRes.data) ||
          !Array.isArray(leavesRes.data) ||
          !Array.isArray(reportsRes.data) ||
          !Array.isArray(projectsRes.data)
        ) {
          throw new Error("Invalid data format received from server");
        }

setTeams(Array.isArray(teamsRes.data) ? teamsRes.data : []);
        setTeamMembers(Array.isArray(teamRes.data) ? teamRes.data : []);
        setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
        setLeaveRequests(Array.isArray(leavesRes.data) ? leavesRes.data : []);
        setProgressReports(
          Array.isArray(reportsRes.data) ? reportsRes.data : []
        );
        setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : []);
      } catch (error: any) {
        console.error("Failed to fetch dashboard data:", error);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLeaveApproval = async (requestId: string, approved: boolean) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not logged in");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      await axios.post(
        `http://localhost:8000/api/manager/leaves/${requestId}/review`,
        { approved },
        config
      );

      setLeaveRequests((prev) =>
        prev.map((lr) =>
          lr.id === requestId
            ? { ...lr, status: approved ? "approved" : "rejected" }
            : lr
        )
      );
    } catch (err) {
      console.error("Leave approval error:", err);
      setError("Failed to update leave request");
    }
    setShowLeaveReview(null);
  };

  const handleProgressApproval = async (
    reportId: string,
    approved: boolean,
    comments?: string
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not logged in");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      await axios.post(
        `http://localhost:8000/api/manager/reports/${reportId}/review`,
        { approved, comments },
        config
      );

      setProgressReports((prev) =>
        prev.map((r) =>
          r.id === reportId ? { ...r, approved, managerComments: comments } : r
        )
      );
    } catch (err) {
      console.error("Progress approval error:", err);
      setError("Failed to update progress report");
    }
    setShowProgressReview(null);
  };

  const handleAddEmployee = async (newEmployee: any) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not logged in");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const res = await axios.post(
        "http://localhost:8000/api/manager/add-employee",
        newEmployee,
        config
      );
      setTeamMembers((prev) => [...prev, res.data]);
      setShowAddEmployee(false);
    } catch (error: any) {
      console.error("Error adding employee:", error);
      setError("Failed to add employee");
    }
  };

  const handleCreateTask = async (newTask: any) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("User not logged in");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const res = await axios.post(
        "http://localhost:8000/api/manager/task",
        {
          ...newTask,
          status: "todo",
          progressPct: 0,
        },
        config
      );

      setTasks((prev) => [...prev, res.data]);
      setShowCreateTask(false);
    } catch (error: any) {
      console.error("Error creating task:", error);
      setError("Failed to create task");
    }
  };

  // Derived data
  const pendingLeaveRequests = Array.isArray(leaveRequests)
    ? leaveRequests.filter((lr) => lr.status === "pending")
    : [];
  const pendingReports = Array.isArray(progressReports)
    ? progressReports.filter((r) => !r.approved).length
    : 0;
  const teamTasks = Array.isArray(tasks)
    ? tasks.filter((task) =>
        teamMembers.some((member) => member.id === task.assigneeId)
      )
    : [];

 
  

  const activeProjects = Array.isArray(projects)
    ? projects.filter((project) => project.status === "active")
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }


  if (!user) return null;

   return (
    <div className="space-y-8">
  {/* Header */}
  <div className="mb-8 px-4 py-6 bg-white shadow-sm rounded-lg">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
          Manager Dashboard
        </h1>
        
        <p className="text-lg text-gray-800 mt-3">Welcome back, {user.name}</p>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setShowCreateTask(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </button>
        <button
          onClick={() => setShowAddEmployee(true)}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add Employee</span>
        </button>
      </div>
    </div>
    <div className="h-2 md:h-4"></div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Teams</p>
                <p className="text-3xl font-bold mt-2">{teamMembers.length}</p>
              </div>

              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Completed Tasks</p>
              <p className="text-3xl font-bold mt-2">
                  {
                    teamTasks.filter((task) => task.status === "completed")
                      .length
                  }
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Pending Approvals</p>
                <p className="text-3xl font-bold mt-2">
                  {pendingLeaveRequests.length}
                </p>
              </div>
              
                <Clock className="w-8 h-8 text-orange-200" />
              </div>
            
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Active Projects</p>
                <p className="text-3xl font-bold mt-2">
                  {activeProjects.length}
                </p>
              </div>
              
                 <Briefcase className="w-8 h-8 text-purple-200" />
              </div>
            </div>
          
        </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  {/* Main Content */}
  <div className="lg:col-span-2 space-y-8">
    {/* Teams Progress */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <Users className="w-7 h-7 text-blue-600" />
          <span>Teams Progress</span>
        </h3>
        <div className="flex items-center space-x-3">
          <span className="text-base text-gray-600 font-medium">
            {teams.length} Teams
          </span>
          <button
            onClick={() => setShowAddEmployee(true)}
            className="bg-green-100 text-green-700 px-4 py-1.5 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium flex items-center space-x-1"
          >
            <UserPlus className="w-5 h-5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.map((team) => (
          <div
            key={team.id}
            className={`bg-gradient-to-br ${
              team.color || 'from-indigo-500 to-purple-600'
            } rounded-xl p-6 text-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
          >
            <div className="flex items-center space-x-4 mb-5">
              <div className="text-4xl">{team.icon || '👥'}</div>
              <div className="flex-1">
                <h4 className="font-bold text-xl">{team.name}</h4>
                <p className="text-white/90 text-base">
                  {team.members} members
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-base">Progress</span>
                <span className="text-2xl font-bold">
                  {Math.round(team.progress)}%
                </span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-3">
                <div
                  className="bg-white h-3 rounded-full transition-all duration-500"
                  style={{ width: `${team.progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div className="text-center">
                  <p className="text-xl font-bold">{team.activeTasks}</p>
                  <p className="text-sm text-white/70">Active</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">{team.completedTasks}</p>
                  <p className="text-sm text-white/70">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">
                    {Math.round(team.progress)}%
                  </p>
                  <p className="text-sm text-white/70">Progress</p>
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
                <a
                  href="/tasks"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All Tasks
                </a>
              </div>

              <div className="space-y-3">
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
                  teamTasks.slice(0, 5).map((task) => {
                    const assignee = teamMembers.find(
                      (u) => u.id === task.assigneeId
                    );
                    const daysUntil = getDaysUntilDeadline(task.dueDate);
                    const overdue = isOverdue(task.dueDate);

                    const dueText = overdue
                      ? `${Math.abs(daysUntil)} day${
                          Math.abs(daysUntil) !== 1 ? "s" : ""
                        } overdue`
                      : daysUntil === 0
                      ? "Due today"
                      : `${daysUntil} day${daysUntil !== 1 ? "s" : ""} left`;

                    return (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h4 className="font-medium text-gray-900">
                              {task.title}
                            </h4>
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
                              <span>{assignee?.name || "Unassigned"}</span>
                            </div>
                            <span
                              className={
                                overdue
                                  ? "text-red-600 font-medium"
                                  : "text-gray-600"
                              }
                            >
                              {dueText}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 ml-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              task.status
                            )}`}
                          >
                            {task.status.replace("_", " ")}
                          </span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${task.progressPct || 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8 text-right">
                            {task.progressPct || 0}%
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Approvals & Quick Actions */}
          <div className="space-y-6">
            {/* Leave Requests */}
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
                  {pendingLeaveRequests.slice(0, 3).map((request) => {
                    const requester = teamMembers.find(
                      (u) => u.id === request.userId
                    );
                    return (
                      <div
                        key={request.id}
                        className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <img
                            src={requester?.avatar}
                            alt={requester?.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {requester?.name}
                            </p>
                            <p className="text-xs text-gray-600 capitalize">
                              {request.type.replace("_", " ")} leave
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {formatDate(request.startDate)} -{" "}
                          {formatDate(request.endDate)}
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

            {/* Progress Reports */}
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
                  {progressReports
                    .filter((r) => !r.approved)
                    .slice(0, 3)
                    .map((report) => {
                      const employee = teamMembers.find(
                        (u) => u.id === report.userId
                      );
                      const task = tasks.find((t) => t.id === report.taskId);
                      return (
                        <div
                          key={report.id}
                          className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <img
                              src={employee?.avatar}
                              alt={employee?.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {employee?.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {task?.title || "Unknown Task"}
                              </p>
                            </div>
                            <span className="text-xs font-medium text-purple-600">
                              {report.progress}%
                            </span>
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
      </div>

      {/* Modals */}
      {showCreateTask && (
        <CreateTaskForm
          onClose={() => setShowCreateTask(false)}
          onSave={handleCreateTask}
          projects={projects}
          teamMembers={teamMembers}
        />
      )}

      {showAddEmployee && (
        <AddEmployee
          onClose={() => setShowAddEmployee(false)}
          onSave={handleAddEmployee}
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

      {showProgressReview && (
        <ProgressReviewModal
          reportId={showProgressReview}
          reports={progressReports}
          tasks={tasks}
          employees={teamMembers}
          onApprove={handleProgressApproval}
          onClose={() => setShowProgressReview(null)}
        />
      )}
    </div>
  );
};

export default ManagerDashboard;
