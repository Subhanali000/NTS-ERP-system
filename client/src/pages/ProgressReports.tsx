import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Send, Plus, Clock, CheckCircle, TrendingUp, Eye, X, Award, Target, MessageSquare, Filter, Search, Users, BarChart3 } from 'lucide-react';
import { getCurrentUser, isDirector, isManager } from '../utils/auth';
import { formatDate, getCurrentDate } from '../utils/dateUtils';

const ProgressReports: React.FC = () => {
  const user = getCurrentUser();
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [showViewReport, setShowViewReport] = useState(false);
  const [viewingReport, setViewingReport] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState(user.id);
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');

  const isDir = isDirector(user.role);
  const isMgr = isManager(user.role);
  const canReviewReports = isDir || isMgr;

  // Mock users for director/manager view
  const availableUsers = [
    { id: user.id, name: 'My Progress', role: user.role },
    ...(isDir ? [
      { id: 'mgr-1', name: 'Robert Davis', role: 'software_development_manager' },
      { id: 'mgr-2', name: 'Anna Martinez', role: 'project_tech_manager' },
      { id: 'mgr-3', name: 'James Wilson', role: 'talent_acquisition_manager' }
    ] : []),
    ...(isMgr ? [
      { id: 'emp-1', name: 'Jennifer Lee', role: 'employee' },
      { id: 'emp-2', name: 'Alex Johnson', role: 'employee' },
      { id: 'emp-3', name: 'Sam Parker', role: 'intern' }
    ] : [])
  ];

  // Enhanced progress reports with more comprehensive data
  const progressReportsWithDates = [
    { 
      userId: user.id,
      date: '2024-02-15', 
      submitted: true, 
      progress: 85, 
      tasks: 3, 
      approved: true,
      managerFeedback: "Excellent progress on the authentication module!",
      accomplishments: "Completed the user authentication module implementation. Fixed 3 critical bugs in the login flow and added comprehensive unit tests. Successfully integrated OAuth2 authentication.",
      challenges: "Encountered some issues with third-party API integration that required additional research and testing. OAuth provider documentation was incomplete.",
      tomorrowPlan: "Start working on the password reset functionality and begin code review for the team. Plan to implement email verification system.",
      submittedAt: "2024-02-15T17:30:00Z"
    },
    { 
      userId: user.id,
      date: '2024-02-14', 
      submitted: true, 
      progress: 78, 
      tasks: 2, 
      approved: true,
      managerFeedback: "Good work on database optimization!",
      accomplishments: "Worked on database optimization queries. Improved performance by 40% on user data retrieval. Completed database indexing for faster searches.",
      challenges: "Database migration took longer than expected due to data consistency checks. Had to resolve foreign key constraint issues.",
      tomorrowPlan: "Continue with API endpoint design and collaborate with the backend team. Focus on implementing caching mechanisms.",
      submittedAt: "2024-02-14T18:15:00Z"
    },
    { 
      userId: user.id,
      date: '2024-02-13', 
      submitted: true, 
      progress: 92, 
      tasks: 4, 
      approved: false,
      accomplishments: "Focused on frontend component development. Created reusable UI components for the dashboard and implemented responsive design for mobile devices.",
      challenges: "Mobile responsiveness required more time than anticipated for complex layouts. CSS grid compatibility issues with older browsers.",
      tomorrowPlan: "Participate in client requirements gathering meeting and finalize component documentation. Test cross-browser compatibility.",
      submittedAt: "2024-02-13T16:45:00Z"
    },
    // Manager reports (for director view)
    {
      userId: 'mgr-1',
      date: '2024-02-15',
      submitted: true,
      progress: 88,
      tasks: 5,
      approved: true,
      managerFeedback: "Strong leadership in team coordination",
      accomplishments: "Led team standup meetings, reviewed 8 pull requests, conducted performance reviews for 3 team members. Completed project milestone planning.",
      challenges: "Resource allocation conflicts between projects. Need to balance team workload better.",
      tomorrowPlan: "Meet with stakeholders for Q2 planning. Review team capacity and redistribute tasks.",
      submittedAt: "2024-02-15T19:00:00Z"
    },
    {
      userId: 'mgr-2',
      date: '2024-02-15',
      submitted: true,
      progress: 91,
      tasks: 4,
      approved: true,
      managerFeedback: "Excellent project delivery management",
      accomplishments: "Delivered project milestone on time. Coordinated with 3 different teams. Resolved technical blockers for the development team.",
      challenges: "Cross-team communication delays. Some dependencies were not clearly defined.",
      tomorrowPlan: "Establish better communication protocols. Create dependency mapping for upcoming sprints.",
      submittedAt: "2024-02-15T18:45:00Z"
    },
    // Add more historical data
    ...Array.from({ length: 20 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i - 1);
      const dateStr = date.toISOString().split('T')[0];
      const isSubmitted = Math.random() > 0.2; // 80% submission rate
      
      return {
        userId: Math.random() > 0.5 ? user.id : (Math.random() > 0.5 ? 'mgr-1' : 'emp-1'),
        date: dateStr,
        submitted: isSubmitted,
        progress: isSubmitted ? Math.floor(Math.random() * 40) + 60 : 0,
        tasks: isSubmitted ? Math.floor(Math.random() * 5) + 1 : 0,
        approved: isSubmitted ? Math.random() > 0.3 : false,
        accomplishments: isSubmitted ? "Daily accomplishments and progress updates..." : "",
        challenges: isSubmitted ? "Challenges faced during the day..." : "",
        tomorrowPlan: isSubmitted ? "Plans for tomorrow..." : "",
        submittedAt: isSubmitted ? `${dateStr}T${17 + Math.floor(Math.random() * 3)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00Z` : ""
      };
    }),
    { 
      userId: user.id,
      date: getCurrentDate(), 
      submitted: false, 
      progress: 0, 
      tasks: 0, 
      approved: false,
      accomplishments: "",
      challenges: "",
      tomorrowPlan: ""
    }
  ];

  // Filter reports by selected user
  const userReports = progressReportsWithDates.filter(r => r.userId === selectedUser);

  const CalendarView = () => {
    const today = getCurrentDate();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const reportData = userReports.find(r => r.date === dateStr);
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
            isToday ? 'bg-gradient-to-br from-blue-100 via-blue-200 to-purple-200 border-blue-500 ring-2 ring-blue-300 shadow-xl' :
            isPast && reportData?.submitted ? 'bg-gradient-to-br from-green-50 via-green-100 to-emerald-100 border-green-300 hover:bg-green-100' :
            isPast && !reportData?.submitted ? 'bg-gradient-to-br from-red-50 via-red-100 to-pink-100 border-red-300' :
            isFuture ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60' :
            'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <div className="text-lg font-bold text-gray-900 mb-2">{day}</div>
          
          {reportData?.submitted && (
            <div className="space-y-2">
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-700 font-semibold">Submitted</span>
                <span className="text-xs text-gray-500">
                  {new Date(reportData.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="bg-white rounded-lg p-3 shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-900">{reportData.progress}%</span>
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
                      reportData.progress >= 90 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                      reportData.progress >= 80 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                      reportData.progress >= 70 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                      reportData.progress >= 60 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                      'bg-gradient-to-r from-red-400 to-red-600'
                    }`}
                    style={{ width: `${reportData.progress}%` }}
                  />
                </div>
                
                <div className="text-xs text-gray-600 mb-2">
                  {reportData.tasks} tasks • {reportData.approved ? 'Approved' : 'Pending'}
                </div>
                
                {reportData.managerFeedback && (
                  <div className="bg-blue-50 rounded p-2 mb-2">
                    <div className="flex items-center space-x-1 mb-1">
                      <MessageSquare className="w-3 h-3 text-blue-600" />
                      <span className="text-xs font-medium text-blue-800">Feedback</span>
                    </div>
                    <p className="text-xs text-blue-700 line-clamp-2">{reportData.managerFeedback}</p>
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

    const navigateMonth = (direction: 'prev' | 'next') => {
      if (direction === 'prev') {
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
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="text-center">
              <h2 className="text-2xl font-bold">
                {new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <p className="text-blue-100 mt-1">Progress Reports Calendar</p>
            </div>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* User Selection for Directors/Managers */}
          {canReviewReports && (
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span className="font-medium">Viewing:</span>
              </div>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/70 focus:bg-white/30 focus:outline-none"
              >
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id} className="text-gray-900">
                    {user.name}
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
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-bold text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-3">
            {days}
          </div>
          
          {/* Enhanced Legend */}
          <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendar Legend</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-100 via-blue-200 to-purple-200 border border-blue-500 rounded-lg"></div>
                <span className="text-gray-700 font-medium">Today - Submit Report</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gradient-to-br from-green-50 via-green-100 to-emerald-100 border border-green-300 rounded-lg"></div>
                <span className="text-gray-700 font-medium">Report Submitted</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gradient-to-br from-red-50 via-red-100 to-pink-100 border border-red-300 rounded-lg"></div>
                <span className="text-gray-700 font-medium">Missing Report</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-50 border border-gray-200 rounded-lg opacity-60"></div>
                <span className="text-gray-700 font-medium">Future Date</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Progress Indicators:</h4>
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

  const SubmitProgressForm = () => {
    const [formData, setFormData] = useState({
      progress: 75,
      accomplishments: '',
      challenges: '',
      tomorrowPlan: ''
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Submit Daily Progress Report</h3>
                <p className="text-blue-100 mt-1">Date: {formatDate(selectedDate)}</p>
              </div>
              <button
                onClick={() => setShowSubmitForm(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <form className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">Overall Progress (%)</label>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) }))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>0%</span>
                  <span className="text-lg font-bold text-blue-600">{formData.progress}%</span>
                  <span>100%</span>
                </div>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    formData.progress >= 90 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                    formData.progress >= 80 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                    formData.progress >= 70 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                    formData.progress >= 60 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                    'bg-gradient-to-r from-red-400 to-red-600'
                  }`}
                  style={{ width: `${formData.progress}%` }}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Key Accomplishments *</label>
              <textarea
                value={formData.accomplishments}
                onChange={(e) => setFormData(prev => ({ ...prev, accomplishments: e.target.value }))}
                rows={4}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Describe your key accomplishments for today..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Challenges Faced</label>
              <textarea
                value={formData.challenges}
                onChange={(e) => setFormData(prev => ({ ...prev, challenges: e.target.value }))}
                rows={3}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Any challenges or blockers encountered..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Tomorrow's Plan</label>
              <textarea
                value={formData.tomorrowPlan}
                onChange={(e) => setFormData(prev => ({ ...prev, tomorrowPlan: e.target.value }))}
                rows={3}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="What do you plan to work on tomorrow..."
              />
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Send className="w-5 h-5" />
                <span>Submit Report</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSubmitForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-400 transition-colors font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ViewReportModal = () => {
    if (!viewingReport) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Progress Report Details</h3>
                <p className="text-green-100 mt-1">Date: {formatDate(viewingReport.date)}</p>
                <p className="text-green-100 text-sm">
                  Submitted: {new Date(viewingReport.submittedAt).toLocaleString()}
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
                <h4 className="text-lg font-bold text-gray-900">Progress Overview</h4>
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
                          viewingReport.progress >= 90 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                          viewingReport.progress >= 80 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                          viewingReport.progress >= 70 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                          viewingReport.progress >= 60 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                          'bg-gradient-to-r from-red-400 to-red-600'
                        }`}
                        style={{ width: `${viewingReport.progress}%` }}
                      />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{viewingReport.progress}%</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">Tasks Completed</p>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="text-2xl font-bold text-gray-900">{viewingReport.tasks}</span>
                    <span className="text-sm text-gray-600">tasks</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Accomplishments */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-600" />
                <span>Key Accomplishments</span>
              </h4>
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                <p className="text-gray-700 leading-relaxed">
                  {viewingReport.accomplishments || "No accomplishments recorded for this date."}
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
                  {viewingReport.challenges || "No challenges recorded for this date."}
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
                  {viewingReport.tomorrowPlan || "No plans recorded for the next day."}
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
                  <p className="text-gray-700 leading-relaxed">{viewingReport.managerFeedback}</p>
                </div>
              </div>
            )}

            {/* Report Metadata */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Submission Date:</span>
                  <span className="ml-2 font-medium text-gray-900">{formatDate(viewingReport.date)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 font-medium ${viewingReport.approved ? 'text-green-600' : 'text-yellow-600'}`}>
                    {viewingReport.approved ? 'Approved' : 'Under Review'}
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
                  <span className={`ml-2 font-medium ${
                    viewingReport.progress >= 90 ? 'text-green-600' :
                    viewingReport.progress >= 80 ? 'text-blue-600' :
                    viewingReport.progress >= 70 ? 'text-yellow-600' :
                    'text-orange-600'
                  }`}>
                    {viewingReport.progress >= 90 ? 'Excellent' :
                     viewingReport.progress >= 80 ? 'Good' :
                     viewingReport.progress >= 70 ? 'Satisfactory' : 'Needs Improvement'}
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
          {isDir ? 'Monitor daily progress across the organization' :
           isMgr ? 'Track team progress and submissions' : 
           'Submit and track your daily progress reports'}
        </p>
      </div>

      {/* Enhanced Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">This Month</p>
              <p className="text-3xl font-bold mt-2">
                {userReports.filter(r => r.submitted).length}
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
                {userReports.filter(r => r.approved).length}
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
                {userReports.filter(r => r.submitted && !r.approved).length}
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
                {Math.round(
                  userReports
                    .filter(r => r.submitted)
                    .reduce((sum, r) => sum + r.progress, 0) / 
                  userReports.filter(r => r.submitted).length || 0
                )}%
              </p>
              <p className="text-purple-100 text-sm">This Month</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Calendar */}
      <CalendarView />

      {/* Submit Form Modal */}
      {showSubmitForm && <SubmitProgressForm />}

      {/* View Report Modal */}
      {showViewReport && <ViewReportModal />}
    </div>
  );
};

export default ProgressReports;