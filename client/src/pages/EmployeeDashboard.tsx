import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Clock,
  Calendar,
  TrendingUp,
  CheckCircle,
  FileText,
  Send,
  Plus,
  Target,
  AlertCircle,
} from "lucide-react";

import { getCurrentUser } from "../utils/auth";
import {
  isOverdue,
  formatDate,
  toDateObject,
  isToday,
  isYesterday,
  isTomorrow,
} from "../utils/dateUtils";
import { differenceInDays } from "date-fns"; // <-- correct source

interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  [key: string]: any;
}

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  type: string;
  [key: string]: any;
}

export interface User {
  id: string;
  name: string;
  email: string;
  annual_leave_balance: number | null;
}

const safeJson = async (response: Response) => {
  try {
    return await response.json();
  } catch (error) {
    console.warn("Failed to parse JSON:", error);
    return [];
  }
};

const EmployeeDashboard: React.FC = () => {
  const authUser = getCurrentUser();
  const user = getCurrentUser(); // used in punch out
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [myLeaveRequests, setMyLeaveRequests] = useState<LeaveRequest[]>([]);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [punchInTime, setPunchInTime] = useState("");
  const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !authUser?.id) throw new Error("User not authenticated");

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        // Do NOT use `const leaveRes = await fetch(...)` inside Promise.all
        const [userRes, tasksRes, leaveRes] = await Promise.all([
          fetch(`http://localhost:8000/api/employee/profile`, { headers }),
          fetch(`http://localhost:8000/api/employee/tasks`, { headers }),
          fetch(`http://localhost:8000/api/employee/leaves`, { headers }),
        ]);

        if (!userRes.ok || !tasksRes.ok || !leaveRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [userData, tasks, leaveRequests] = await Promise.all([
          safeJson(userRes),
          safeJson(tasksRes),
          safeJson(leaveRes),
        ]);

        setCurrentUser(userData);
        setMyTasks(tasks);
        setMyLeaveRequests(leaveRequests);
      } catch (err: any) {
        console.error("❌ Error fetching employee data:", err.message || err);
      }
    };

    fetchData();
  }, [authUser?.id]);

  const LEAVE_QUOTA = 20;

  const approvedLeaves = myLeaveRequests.filter(
    (lr) => lr.user_id === currentUser?.id && lr.status === "approved"
  );

  const usedDays = approvedLeaves.reduce((sum, lr) => {
    const start = new Date(lr.start_date);
    const end = new Date(lr.end_date);
    const days =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return sum + Math.max(1, days); // Always at least 1 day
  }, 0);

  const remainingDays = Math.max(0, LEAVE_QUOTA - usedDays);

  const completedTasks = myTasks.filter(
    (t) => t.status?.toLowerCase() === "completed"
  );
  const inProgressTasks = myTasks.filter(
    (t) => t.status?.toLowerCase() === "in_progress"
  );
  const overdueTasks = myTasks.filter(
    (t) =>
      t.dueDate &&
      t.status &&
      isOverdue(t.dueDate) &&
      t.status.toLowerCase() !== "completed"
  );

  const getDaysUntilDeadline = (dueDate: string) => {
    const today = new Date();
    const deadline = toDateObject(dueDate);
    return differenceInDays(deadline, today);
  };
  interface LeaveRequestFormProps {
    onClose: () => void;
    setLeaveRequests: React.Dispatch<React.SetStateAction<any[]>>;
    leaveRequests: any[];
  }

  const LeaveRequestForm: React.FC<LeaveRequestFormProps> = ({
    onClose,
    setLeaveRequests,
  }) => {
    const user = getCurrentUser();

    const [formData, setFormData] = useState({
      leave_type: "vacation",
      startDate: "",
      endDate: "",
      reason: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
      const newErrors: Record<string, string> = {};

      if (!formData.startDate) newErrors.startDate = "Start date is required";
      if (!formData.endDate) newErrors.endDate = "End date is required";
      if (!formData.reason.trim()) newErrors.reason = "Reason is required";

      const now = new Date();
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      if (start < new Date(now.setHours(0, 0, 0, 0))) {
        newErrors.startDate = "Start date cannot be in the past";
      }

      if (start > end) {
        newErrors.endDate = "End date must be after start date";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleLeaveSubmission = async () => {
      try {
        const role = user.role.toLowerCase();
        const token = localStorage.getItem("token");
        if (!token || !user?.id) throw new Error("Unauthorized");

        const payload = {
          leave_type: formData.leave_type,
          start_date: formData.startDate,
          end_date: formData.endDate,
          reason: formData.reason,
          userId: user.id,
        };

        const res = await fetch(`http://localhost:8000/api/${role}/leave`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const body = await res.json();

        if (!res.ok)
          throw new Error(body.error || "Failed to submit leave request");

        const mappedLeave = {
          id: body.id,
          userId: body.user_id,
          type: body.leave_type,
          startDate: body.start_date,
          endDate: body.end_date,
          reason: body.reason,
          status: body.status,
          managerApproval: body.manager_approval,
          directorApproval: body.director_approval,
          createdAt: body.created_at,
        };

        setLeaveRequests((prev) => [...prev, mappedLeave]);
        onClose();
      } catch (err) {
        console.error("Error submitting leave:", err);
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (validateForm()) {
        handleLeaveSubmission();
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Request Leave
            </h3>
            <p className="text-gray-600 mt-1">
              Submit a new leave request for approval
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Leave Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Leave Type *
              </label>
              <select
                name="leave_type"
                value={formData.leave_type}
                onChange={(e) =>
                  setFormData({ ...formData, leave_type: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="vacation">Vacation</option>
                <option value="sick">Sick Leave</option>
                <option value="personal">Personal</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className={`w-full border rounded-lg px-3 py-2 ${
                  errors.startDate ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.startDate && (
                <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className={`w-full border rounded-lg px-3 py-2 ${
                  errors.endDate ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.endDate && (
                <p className="text-red-600 text-sm mt-1">{errors.endDate}</p>
              )}
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason *
              </label>
              <textarea
                rows={3}
                value={formData.reason}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, reason: e.target.value }))
                }
                className={`w-full border rounded-lg px-3 py-2 ${
                  errors.reason ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Please provide a reason for your leave request..."
              />
              {errors.reason && (
                <p className="text-red-600 text-sm mt-1">{errors.reason}</p>
              )}
            </div>

            {/* Buttons */}
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
                onClick={onClose}
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
  interface ProgressReportFormProps {
    onClose: () => void;
    myTasks: Task[]; // <-- add this
  }

  const ProgressReportForm: React.FC<ProgressReportFormProps> = ({
    onClose,
  }) => {
    const [selectedTask, setSelectedTask] = useState("");

    const [progressPct, setProgressPct] = useState(50);
    const [progressDetails, setProgressDetails] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!selectedTask) {
        alert("Please select a task");
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Unauthorized");

        const res = await fetch(
          `http://localhost:8000/api/employee/tasks/${selectedTask}/progress`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              progressPct,
              progressDetails,
            }),
          }
        );

        if (!res.ok) throw new Error("Failed to submit progress");

        console.log("✅ Progress submitted");
        onClose();
      } catch (err: any) {
        console.error("❌ Progress submission error:", err.message || err);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Submit Progress Report
          </h3>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Task
              </label>
              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="">Choose a task...</option>
                {myTasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Progress Percentage
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={progressPct}
                onChange={(e) => setProgressPct(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">{progressPct}%</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Progress Details
              </label>
              <textarea
                rows={4}
                value={progressDetails}
                onChange={(e) => setProgressDetails(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Describe what you've accomplished and any challenges faced..."
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? "Submitting..." : "Submit Report"}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
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
  useEffect(() => {
    const storedPunchStatus = localStorage.getItem("isPunchedIn");
    const storedPunchTime = localStorage.getItem("punchInTime");

    if (storedPunchStatus === "true" && storedPunchTime) {
      setIsPunchedIn(true);
      setPunchInTime(storedPunchTime);
    }
  }, []);
  const handlePunchToggle = async () => {
    if (isPunchedIn) {
      await handlePunchOut();
    } else {
      await handlePunchIn();
    }
  };
  const handlePunchIn = async () => {
    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isPunchedIn) {
      console.warn("Already punched in for today.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");

      const res = await fetch(`http://localhost:8000/api/employee/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          punch_in: currentTime,
          date: today,
          status: "present",
        }),
      });

      if (!res.ok) throw new Error("Failed to punch in");

      setIsPunchedIn(true);
      setPunchInTime(currentTime);

      // Persist state
      localStorage.setItem("isPunchedIn", "true");
      localStorage.setItem("punchInTime", currentTime);

      console.log("✅ Punched in at:", currentTime);
    } catch (err: any) {
      console.error("❌ Punch in error:", err.message || err);
    }
  };

  const handlePunchOut = async () => {
    const currentTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    try {
      const token = localStorage.getItem("token");
      if (!token || !user?.id) throw new Error("Unauthorized");

      const res = await fetch(
        `http://localhost:8000/api/employee/attendance/${today}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ punch_out: currentTime }),
        }
      );

      if (!res.ok) throw new Error("Failed to punch out");

      setIsPunchedIn(false);
      setPunchInTime("");

      // Clear localStorage
      localStorage.removeItem("isPunchedIn");
      localStorage.removeItem("punchInTime");

      console.log("✅ Punched out at:", currentTime);
    } catch (err: any) {
      console.error("❌ Punch out error:", err.message || err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {currentUser?.name || "Employee"}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's your personal dashboard overview
        </p>
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
              <p className="text-3xl font-bold mt-2">
                {inProgressTasks.length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-200" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Leave Balance</p>
              <p className="text-3xl font-bold mt-2">{remainingDays}</p>{" "}
              {/* <-- use computed value */}
            </div>
            <Calendar className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowLeaveForm(true)}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group"
          >
            <Calendar className="w-6 h-6 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="font-medium text-gray-900">Apply for Leave</h4>
            <p className="text-sm text-gray-600">Submit a new leave request</p>
          </button>
          <button
            onClick={handlePunchToggle}
            className={`p-4 border border-gray-200 rounded-lg transition-colors text-left group hover:bg-gray-50 ${
              isPunchedIn ? "bg-red-100" : "bg-white"
            }`}
          >
            <Clock
              className={`w-6 h-6 mb-2 group-hover:scale-110 transition-transform ${
                isPunchedIn ? "text-red-600" : "text-green-500"
              }`}
            />
            <h4
              className={`font-medium ${
                isPunchedIn ? "text-red-700" : "text-gray-900"
              }`}
            >
              {isPunchedIn ? "Punch Out" : "Punch In"}
            </h4>
            <p className="text-sm text-gray-600">
              {isPunchedIn ? "End your shift" : "Start your shift"}
            </p>
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
          <Link
            to="/tasks"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All Tasks
          </Link>
        </div>

        {myTasks.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No tasks assigned yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myTasks.slice(0, 5).map((task) => {
              const daysUntil = getDaysUntilDeadline(task.dueDate);
              const overdue = isOverdue(task.dueDate);

              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : task.status === "in_progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {task.status.replace("_", " ")}
                      </span>
                      <span
                        className={`text-xs ${
                          overdue ? "text-red-600 font-medium" : "text-gray-500"
                        }`}
                      >
                        {overdue
                          ? `${Math.abs(daysUntil)} days overdue`
                          : daysUntil === 0
                          ? "Due today"
                          : daysUntil > 0
                          ? `${daysUntil} days left`
                          : "Completed"}
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
                    <span className="text-sm text-gray-600">
                      {task.progressPct}%
                    </span>
                    {overdue && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
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
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Leave Requests
          </h3>
          <Link
            to="/leave-management"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All Requests
          </Link>
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
            {myLeaveRequests.slice(0, 3).map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div>
                  <h4 className="font-medium text-gray-900 capitalize">
                    {request.leave_type?.replace("_", " ") || "Unknown"} Leave
                  </h4>
                  <p className="text-sm text-gray-600">
                    {formatDate(request.start_date)} -{" "}
                    {formatDate(request.end_date)} (
                    {Math.ceil(
                      (new Date(request.end_date).getTime() -
                        new Date(request.start_date).getTime()) /
                        (1000 * 3600 * 24)
                    ) + 1}{" "}
                    days)
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : request.status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showLeaveForm && (
        <LeaveRequestForm
          onClose={() => setShowLeaveForm(false)}
          leaveRequests={myLeaveRequests}
          setLeaveRequests={setMyLeaveRequests}
        />
      )}

      {showProgressForm && (
        <ProgressReportForm
          onClose={() => setShowProgressForm(false)}
          myTasks={myTasks}
        />
      )}
    </div>
  );
};

export default EmployeeDashboard;
