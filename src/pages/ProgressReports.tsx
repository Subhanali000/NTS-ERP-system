import React, { useState, useEffect } from "react";
import Select from "react-select";

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Send,
  Plus,
  Clock,
  CheckCircle,
  TrendingUp,
  Eye,
  X,
  Award,
  Target,
  MessageSquare,
  Filter,
  Search,
  Users,
  BarChart3,
} from "lucide-react";
import { getCurrentUser, isDirector, isManager, getUserAccessLevel } from "../utils/auth";
import { formatDate, getCurrentDate } from "../utils/dateUtils";

export interface User {
  id: string;
  role: string;
  name?: string;
  email?: string;
  managerId?: string;
  department?: string;
}

// Form Component
interface SubmitProgressFormProps {
  formData: {
    progress: number;
    accomplishments: string;
    challenges: string;
    tomorrowPlan: string;
    tasks: string[]; // ✅ new
  };
  setFormData: React.Dispatch<
    React.SetStateAction<SubmitProgressFormProps["formData"]>
  >;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  selectedDate: string;
  hasSubmittedToday: boolean;
  availableTasks: {
    value: string;
    label: string;
    isDisabled?: boolean; // ✅ Add this
  }[];
  // ✅ new prop
}

const SubmitProgressForm: React.FC<SubmitProgressFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  onClose,
  selectedDate,
  hasSubmittedToday,
  availableTasks,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Submit Daily Progress Report</h3>
            <p className="text-blue-100 mt-1">
              Date: {formatDate(selectedDate)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">
            Overall Progress (%)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.progress}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                progress: parseInt(e.target.value),
              }))
            }
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>0%</span>
            <span className="text-lg font-bold text-blue-600">
              {formData.progress}%
            </span>
            <span>100%</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                formData.progress >= 90
                  ? "bg-gradient-to-r from-green-400 to-green-600"
                  : formData.progress >= 80
                  ? "bg-gradient-to-r from-blue-400 to-blue-600"
                  : formData.progress >= 70
                  ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                  : formData.progress >= 60
                  ? "bg-gradient-to-r from-orange-400 to-orange-600"
                  : "bg-gradient-to-r from-red-400 to-red-600"
              }`}
              style={{ width: `${formData.progress}%` }}
            />
          </div>
        </div>
        <div className="relative">
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Tasks Completed
          </label>
          <Select
  isMulti
  options={availableTasks}
  value={availableTasks.filter((task) =>
    formData.tasks.includes(task.value)
  )}
  onChange={(selected) =>
    setFormData((prev) => ({
      ...prev,
      tasks: selected ? selected.map((task) => task.value) : [],
    }))
  }
  className="w-full"
  placeholder="Select tasks..."
  isClearable={false}
  isSearchable
  getOptionLabel={(e) => e.label}
  getOptionValue={(e) => e.value}
  isOptionDisabled={(option) => option.isDisabled === true}
  styles={{
    option: (base, { isDisabled, isSelected, isFocused }) => ({
      ...base,
      color: isDisabled ? '#065f46' : base.color,
      backgroundColor: isDisabled
        ? '#d1fae5' // ✅ light green
        : isSelected
        ? '#2563eb' // ✅ blue-600
        : isFocused
        ? '#dbeafe' // ✅ blue-100 on hover
        : undefined,
      cursor: isDisabled ? 'not-allowed' : 'default',
    }),
  }}
/>

          <p className="text-xs text-gray-500 mt-1 italic">
            * Select all tasks you completed today.
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Key Accomplishments *
          </label>
          <textarea
            value={formData.accomplishments}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                accomplishments: e.target.value,
              }))
            }
            required
            rows={4}
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your key accomplishments for today..."
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Challenges Faced
          </label>
          <textarea
            value={formData.challenges}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, challenges: e.target.value }))
            }
            rows={3}
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any challenges or blockers encountered..."
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Tomorrow's Plan
          </label>
          <textarea
            value={formData.tomorrowPlan}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, tomorrowPlan: e.target.value }))
            }
            rows={3}
            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="What do you plan to work on tomorrow..."
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={hasSubmittedToday}
            className={`flex-1 py-3 px-4 rounded-xl font-bold shadow-lg flex items-center justify-center space-x-2 transition-transform ${
              hasSubmittedToday
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-xl transform hover:scale-105"
            }`}
          >
            <Send className="w-5 h-5" />
            <span>
              {hasSubmittedToday ? "Already Submitted" : "Submit Report"}
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-400 font-bold"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
);

const ProgressReports: React.FC = () => {
  const fallbackUser = { id: "", role: "employee" };
  const user = getCurrentUser() ?? fallbackUser;

  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [calendarView, setCalendarView] = useState<"month" | "week">("month");
  const [reports, setReports] = useState<any[]>([]);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [showViewReport, setShowViewReport] = useState(false);
  const [viewingReport, setViewingReport] = useState<any>(null);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState(user.id);
  const [loading, setLoading] = useState(true);
  const [availableTasks, setAvailableTasks] = useState<
    { value: string; label: string; isDisabled?: boolean }[]
  >([]);
// Define access level permissions:
// - Employee: Can only see their own data
// - Manager: Can see their own data + their direct reports (team members assigned to them)
// - Director: Can see their own data + managers assigned to them + those managers' team members
const getAccessibleTeamMembers = (currentUser: any, allTeamMembers: any[]): any[] => {
  if (!currentUser || !Array.isArray(allTeamMembers)) return [];

  const accessLevel = getUserAccessLevel(currentUser.role);
  
  if (accessLevel === 'employee') {
    // Employee can only see their own data
    return allTeamMembers.filter(member => member.id === currentUser.id);
  }

  if (accessLevel === 'manager') {
    // Manager can see their own data + their direct reports (employees assigned to them)
    const directReports = allTeamMembers.filter(member => member.managerId === currentUser.id);
    const self = allTeamMembers.find(member => member.id === currentUser.id);
    
    const accessibleMembers = [];
    if (self) accessibleMembers.push(self);
    accessibleMembers.push(...directReports);
    
    // Remove duplicates by ID
    return Array.from(new Map(accessibleMembers.map(member => [member.id, member])).values());
  }

  if (accessLevel === 'director') {
    // Director can see:
    // 1. Their own data
    // 2. Managers assigned to them (managerId === director.id)
    // 3. Employees under those managers
    
    const self = allTeamMembers.find(member => member.id === currentUser.id);
    const assignedManagers = allTeamMembers.filter(member => 
      member.managerId === currentUser.id && getUserAccessLevel(member.role) === 'manager'
    );
    const managerIds = assignedManagers.map(manager => manager.id);
    const employeesUnderManagers = allTeamMembers.filter(member => 
      managerIds.includes(member.managerId) && getUserAccessLevel(member.role) === 'employee'
    );
    
    const accessibleMembers = [];
    if (self) accessibleMembers.push(self);
    accessibleMembers.push(...assignedManagers);
    accessibleMembers.push(...employeesUnderManagers);
    
    // Remove duplicates by ID
    return Array.from(new Map(accessibleMembers.map(member => [member.id, member])).values());
  }

  // Fallback: only show current user
  return allTeamMembers.filter(member => member.id === currentUser.id);
};
  const [formData, setFormData] = useState({
    progress: 50,
    accomplishments: "",
    challenges: "",
    tomorrowPlan: "",
    tasks: [],
  });

  const canReviewReports = ["manager", "director"].includes(
    getUserAccessLevel(user.role)
  );
  
  // Define access level variables
  const userAccessLevel = getUserAccessLevel(user.role);
  const isDir = userAccessLevel === 'director';
  const isMgr = userAccessLevel === 'manager';
  const isEmp = userAccessLevel === 'employee';

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const role = user?.role;

      const res = await fetch(
        `http://localhost:8000/api/${role}/progress-report`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch reports");

      const rawData = await res.json();

      const normalized = rawData.map((report: any) => ({
        id: report.id,
        date: report.report_date,
        user_id: report.user_id,
        submitted: !!report.submitted_at,
        submittedAt: report.submitted_at,
        progress: report.progress_percent ?? 0,
        tasks: Array.isArray(report.tasks) ? report.tasks : [],
        approved: report.status === "approved",
        approvedAt: report.approved_at,
        approvedBy: report.approved_by,
        approvedByRole: report.approved_by_role,
        status: report.status,
        accomplishments: report.accomplishments ?? "",
        challenges: report.challenges ?? "",
        tomorrowPlan: report.tomorrow_plan ?? "",
        managerFeedback: report.manager_feedback ?? "",
      }));

      setReports(normalized);
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const role = user?.role;

      const res = await fetch(`http://localhost:8000/api/${role}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      const formatted = data
        .map((task: any) => ({
          label: task.title + (task.status === "completed" ? " (Completed)" : ""),
          value: task.id,
          isDisabled: task.status === "completed",
        }))
        .sort((a, b) => (a.isDisabled === b.isDisabled ? 0 : a.isDisabled ? 1 : -1));

      setAvailableTasks(formatted);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  };

//   const fetchTeam = async () => {
//   try {
//     const token = localStorage.getItem("token");
//     const role = user?.role;

//     const endpoint = `http://localhost:8000/api/${role}/teams`;//employee
//     console.log("📡 Fetching team from:", endpoint);

//     const res = await fetch(endpoint, {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     console.log("📥 Response status:", res.status);

//     const data = await res.json();
//     console.log("📄 Response data:", data);

//     if (Array.isArray(data.users)) {
//       const accessibleUsers = getAccessibleTeamMembers(user, data.users);
//       console.log("✅ Accessible team members:", accessibleUsers);

//       setAvailableUsers(accessibleUsers);

//       // Set default selected user
//       if (!selectedUser || !accessibleUsers.find(u => u.id === selectedUser)) {
//         setSelectedUser(user.id);
//         console.log("🎯 Default selected user set to:", user.id);
//       }
//     } else {
//       console.warn("⚠️ Unexpected team API response, falling back to current user.");
//       setAvailableUsers([user]);
//       setSelectedUser(user.id);
//     }
//   } catch (err) {
//     console.error("❌ Failed to fetch team:", err);
//     setAvailableUsers([user]);
//     setSelectedUser(user.id);
//   }
// };

  const hasSubmittedToday = () => {
    const today = getCurrentDate();
    return reports.some(
      (r) => r.user_id === user.id && r.date === today && r.submitted
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasSubmittedToday()) {
      alert("You've already submitted a report for today.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const role = user?.role;

      const res = await fetch(
        `http://localhost:8000/api/${role}/progress-report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            progress_percent: formData.progress,
            accomplishments: formData.accomplishments,
            challenges: formData.challenges,
            tomorrow_plan: formData.tomorrowPlan,
            tasks: formData.tasks,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        alert(result.error || "Failed to submit");
      } else {
        alert("Report submitted!");
        await fetchReports();
        setFormData({
          progress: 50,
          accomplishments: "",
          challenges: "",
          tomorrowPlan: "",
          tasks: [],
        });
        setShowSubmitForm(false);
      }
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchTasks();
    
    // Always fetch team data to determine accessible users based on role
    // fetchTeam();
  }, []);

const userReports = reports.filter((r) => r.user_id === selectedUser);

  const CalendarView = () => {
    const today = getCurrentDate();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      const reportData = userReports.find((r) => r.date === dateStr);
      const isToday = dateStr === today;
      const isPast = new Date(dateStr) < new Date(today);
      const isFuture = new Date(dateStr) > new Date(today);
      const isCurrentUser = selectedUser === user.id;

      days.push(
        <div
          key={day}
          onClick={() => {
            setSelectedDate(dateStr);
            if (isToday && !reportData?.submitted && isCurrentUser) {
              setShowSubmitForm(true);
            } else if (reportData?.submitted) {
              setViewingReport(reportData);
              setShowViewReport(true);
            }
          }}
          className={`p-4 border rounded-xl cursor-pointer transition-all duration-300 min-h-[140px] hover:shadow-lg transform hover:scale-105 ${
            isToday
              ? "bg-gradient-to-br from-blue-100 via-blue-200 to-purple-200 border-blue-500 ring-2 ring-blue-300 shadow-xl"
              : isPast && reportData?.submitted
              ? "bg-gradient-to-br from-green-50 via-green-100 to-emerald-100 border-green-300 hover:bg-green-100"
              : isPast && !reportData?.submitted
              ? "bg-gradient-to-br from-red-50 via-red-100 to-pink-100 border-red-300"
              : isFuture
              ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-60"
              : "bg-white border-gray-200 hover:bg-gray-50"
          }`}
        >
          <div className="text-lg font-bold text-gray-900 mb-2">{day}</div>

          {reportData?.submitted && (
            <div className="space-y-2">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-700 font-semibold">
                  Submitted
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(reportData.submittedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-900">
                    {reportData.progress}%
                  </span>
                  <div className="flex items-center space-x-1">
                    {reportData.approved ? (
                      <Award className="w-3 h-3 text-green-600" />
                    ) : (
                      <Clock className="w-3 h-3 text-yellow-600" />
                    )}
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      reportData.progress >= 90
                        ? "bg-gradient-to-r from-green-400 to-green-600"
                        : reportData.progress >= 80
                        ? "bg-gradient-to-r from-blue-400 to-blue-600"
                        : reportData.progress >= 70
                        ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                        : reportData.progress >= 60
                        ? "bg-gradient-to-r from-orange-400 to-orange-600"
                        : "bg-gradient-to-r from-red-400 to-red-600"
                    }`}
                    style={{ width: `${reportData.progress}%` }}
                  />
                </div>

                <div className="text-xs text-gray-600 mb-2">
                  {Array.isArray(reportData.tasks)
                    ? reportData.tasks.length
                    : 0}{" "}
                  tasks • {reportData.approved ? "Approved" : "Pending"}
                </div>

                {reportData.managerFeedback && (
                  <div className="bg-blue-50 rounded p-2 mb-2">
                    <div className="flex items-center space-x-1 mb-1">
                      <MessageSquare className="w-3 h-3 text-blue-600" />
                      <span className="text-xs font-medium text-blue-800">
                        Feedback
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 line-clamp-2">
                      {reportData.managerFeedback}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-2 rounded-lg text-center shadow-md hover:shadow-lg transition-shadow flex items-center justify-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>View Details</span>
              </div>
            </div>
          )}

          {isToday && !reportData?.submitted && isCurrentUser && (
            <div className="mt-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-2 rounded-lg text-center shadow-md hover:shadow-lg transition-shadow animate-pulse">
                📝 Submit Today's Report
              </div>
            </div>
          )}

          {isPast && !reportData?.submitted && (
            <div className="mt-2">
              <div className="bg-red-100 border border-red-300 text-red-700 text-xs font-medium px-2 py-1 rounded-lg text-center">
                ❌ Missing Report
              </div>
            </div>
          )}
        </div>
      );
    }

    const navigateMonth = (direction: "prev" | "next") => {
      if (direction === "prev") {
        if (currentMonth === 0) {
          setCurrentMonth(11);
          setCurrentYear(currentYear - 1);
        } else {
          setCurrentMonth(currentMonth - 1);
        }
      } else {
        if (currentMonth === 11) {
          setCurrentMonth(0);
          setCurrentYear(currentYear + 1);
        } else {
          setCurrentMonth(currentMonth + 1);
        }
      }
    };

    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Calendar Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="text-center">
              <h2 className="text-2xl font-bold">
                {new Date(currentYear, currentMonth).toLocaleDateString(
                  "en-US",
                  { month: "long", year: "numeric" }
                )}
              </h2>
              <p className="text-blue-100 mt-1">Progress Reports Calendar</p>
            </div>
            <button
              onClick={() => navigateMonth("next")}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* User Selection for Directors/Managers */}
          {availableUsers.length > 1 && (
  <div className="flex items-center justify-center space-x-4">
    <div className="flex items-center space-x-2">
      <Users className="w-5 h-5" />
      <span className="font-medium">
        {userAccessLevel === 'director' ? 'Viewing Team Member:' : 
         userAccessLevel === 'manager' ? 'Viewing Team Member:' : 
         'Viewing:'}
      </span>
    </div>
    <select
      value={selectedUser}
      onChange={(e) => setSelectedUser(e.target.value)}
      className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/70 focus:bg-white/30 focus:outline-none"
    >
      {availableUsers.map((user) => (
        <option
          key={user.id}
          value={user.id}
          className="text-gray-900"
        >
          {user.name || user.email || `User ${user.id}`} 
          {getUserAccessLevel(user.role) !== 'employee' && ` (${getUserAccessLevel(user.role)})`}
        </option>
      ))}
    </select>
  </div>
          )}
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {[
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ].map((day) => (
              <div
                key={day}
                className="p-3 text-center text-sm font-bold text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-3">{days}</div>

          {/* Enhanced Legend */}
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Calendar Legend
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-100 via-blue-200 to-purple-200 border border-blue-500 rounded-lg"></div>
                <span className="text-gray-700 font-medium">
                  Today - Submit Report
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gradient-to-br from-green-50 via-green-100 to-emerald-100 border border-green-300 rounded-lg"></div>
                <span className="text-gray-700 font-medium">
                  Report Submitted
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gradient-to-br from-red-50 via-red-100 to-pink-100 border border-red-300 rounded-lg"></div>
                <span className="text-gray-700 font-medium">
                  Missing Report
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-50 border border-gray-200 rounded-lg opacity-60"></div>
                <span className="text-gray-700 font-medium">Future Date</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">
                Progress Indicators:
              </h4>
              <div className="flex items-center space-x-6 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-2 bg-gradient-to-r from-green-400 to-green-600 rounded"></div>
                  <span>90-100%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded"></div>
                  <span>80-89%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-2 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded"></div>
                  <span>70-79%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded"></div>
                  <span>60-69%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-2 bg-gradient-to-r from-red-400 to-red-600 rounded"></div>
                  <span>Below 60%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  interface Report {
    date: string;
    submittedAt: string;
    progress: number;
    tasks: { id: string; title: string }[]; // can be array or JSON string
    accomplishments: string;
    challenges: string;
    tomorrowPlan: string;
    approved: boolean;
    managerFeedback?: string;
  }

  interface Props {
    viewingReport: Report | null;
    setShowViewReport: (show: boolean) => void;
  }

  const ViewReportModal: React.FC<Props> = ({
    viewingReport,
    setShowViewReport,
  }) => {
    if (!viewingReport) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Progress Report Details</h3>
                <p className="text-green-100 mt-1">
                  Date: {formatDate(viewingReport.date)}
                </p>
                <p className="text-green-100 text-sm">
                  Submitted:{" "}
                  {new Date(viewingReport.submittedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setShowViewReport(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Progress Overview */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-900">
                  Progress Overview
                </h4>
                <div className="flex items-center space-x-2">
                  {viewingReport.approved ? (
                    <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Approved</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">Under Review</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Overall Progress</p>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full transition-all duration-500 ${
                          viewingReport.progress >= 90
                            ? "bg-gradient-to-r from-green-400 to-green-600"
                            : viewingReport.progress >= 80
                            ? "bg-gradient-to-r from-blue-400 to-blue-600"
                            : viewingReport.progress >= 70
                            ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                            : viewingReport.progress >= 60
                            ? "bg-gradient-to-r from-orange-400 to-orange-600"
                            : "bg-gradient-to-r from-red-400 to-red-600"
                        }`}
                        style={{ width: `${viewingReport.progress}%` }}
                      />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">
                      {viewingReport.progress}%
                    </span>
                  </div>
                </div>

                {/* Tasks Section */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Tasks Completed</p>
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="text-2xl font-bold text-gray-900">
                      {Array.isArray(viewingReport.tasks)
                        ? viewingReport.tasks.length
                        : 0}
                    </span>
                    <span className="text-sm text-gray-600">tasks</span>
                  </div>

                  {Array.isArray(viewingReport.tasks) &&
                  viewingReport.tasks.length > 0 ? (
                    <div className="space-y-1">
                      {viewingReport.tasks.map((task, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-2 text-sm text-gray-700"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>
                            {typeof task === "object" && task?.title
                              ? task.title
                              : String(task)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No tasks completed</p>
                  )}
                </div>
              </div>
            </div>

            {/* Tasks Completed */}

            {/* Accomplishments */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-600" />
                <span>Key Accomplishments</span>
              </h4>
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                <p className="text-gray-700 leading-relaxed">
                  {viewingReport.accomplishments ||
                    "No accomplishments recorded for this date."}
                </p>
              </div>
            </div>

            {/* Challenges */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span>Challenges Faced</span>
              </h4>
              <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                <p className="text-gray-700 leading-relaxed">
                  {viewingReport.challenges ||
                    "No challenges recorded for this date."}
                </p>
              </div>
            </div>

            {/* Tomorrow's Plan */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>Next Day's Plan</span>
              </h4>
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                <p className="text-gray-700 leading-relaxed">
                  {viewingReport.tomorrowPlan ||
                    "No plans recorded for the next day."}
                </p>
              </div>
            </div>

            {/* Manager Feedback */}
            {viewingReport.managerFeedback && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  <span>Manager Feedback</span>
                </h4>
                <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                  <p className="text-gray-700 leading-relaxed">
                    {viewingReport.managerFeedback}
                  </p>
                </div>
              </div>
            )}

            {/* Report Metadata */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Submission Date:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {formatDate(viewingReport.date)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`ml-2 font-medium ${
                      viewingReport.approved
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {viewingReport.approved ? "Approved" : "Under Review"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Submitted At:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {new Date(viewingReport.submittedAt).toLocaleTimeString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Progress Level:</span>
                  <span
                    className={`ml-2 font-medium ${
                      viewingReport.progress >= 90
                        ? "text-green-600"
                        : viewingReport.progress >= 80
                        ? "text-blue-600"
                        : viewingReport.progress >= 70
                        ? "text-yellow-600"
                        : "text-orange-600"
                    }`}
                  >
                    {viewingReport.progress >= 90
                      ? "Excellent"
                      : viewingReport.progress >= 80
                      ? "Good"
                      : viewingReport.progress >= 70
                      ? "Satisfactory"
                      : "Needs Improvement"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setShowViewReport(false)}
              className="w-full bg-gray-600 text-white py-3 px-4 rounded-xl hover:bg-gray-700 transition-colors font-bold"
            >
              Close Report
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
          Progress Reports Calendar
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          {isDir
            ? "Monitor daily progress across the organization"
            : isMgr
            ? "Track team progress and submissions"
            : "Submit and track your daily progress reports"}
        </p>
      </div>

      {/* Enhanced Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">This Month</p>
              <p className="text-3xl font-bold mt-2">
                {userReports.filter((r) => r.submitted).length || 0}
              </p>
              <p className="text-blue-100 text-sm">Reports Submitted</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Approved</p>
              <p className="text-3xl font-bold mt-2">
                {userReports.filter((r) => r.approved).length || 0}
              </p>
              <p className="text-green-100 text-sm">Reports Approved</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Pending</p>
              <p className="text-3xl font-bold mt-2">
                {userReports.filter((r) => r.submitted && !r.approved).length || 0}
              </p>
              <p className="text-orange-100 text-sm">Awaiting Review</p>
            </div>
            <Clock className="w-8 h-8 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Avg Progress</p>
              <p className="text-3xl font-bold mt-2">
                {userReports.filter((r) => r.submitted).length > 0 ? Math.round(
                  userReports
                    .filter((r) => r.submitted)
                    .reduce((sum, r) => sum + (r.progress || 0), 0) /
                    userReports.filter((r) => r.submitted).length
                ) : 0}
                %
              </p>
              <p className="text-purple-100 text-sm">This Month</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Calendar */}
      <CalendarView />

      {showSubmitForm && (
        <SubmitProgressForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={() => setShowSubmitForm(false)}
          selectedDate={selectedDate}
          hasSubmittedToday={hasSubmittedToday()}
          availableTasks={availableTasks} // ✅ pass it here
        />
      )}

      {showViewReport && (
        <ViewReportModal
          viewingReport={viewingReport}
          setShowViewReport={setShowViewReport}
        />
      )}
    </div>
  );
};

export default ProgressReports;
