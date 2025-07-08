import React, { useState } from 'react';
import { Send, Calendar, Clock, CheckCircle, FileText, Upload, X, Plus, TrendingUp, Target, Award, MessageSquare } from 'lucide-react';
import { getCurrentUser } from '../utils/auth';
import { formatDate, formatDateTime, getCurrentDate } from '../utils/dateUtils';

interface DailyProgressEntry {
  id: string;
  userId: string;
  date: string;
  content: string;
  attachments?: string[];
  submittedAt: string;
  status: 'draft' | 'submitted' | 'reviewed';
  managerFeedback?: string;
}

const DailyProgress: React.FC = () => {
  const user = getCurrentUser();
  const [progressContent, setProgressContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Mock data for previous submissions
  const [progressHistory] = useState<DailyProgressEntry[]>([
    {
      id: '1',
      userId: user.id,
      date: '2024-02-12',
      content: 'Completed the user authentication module implementation. Fixed 3 critical bugs in the login flow and added comprehensive unit tests. Started working on the password reset functionality. Attended team standup and code review session.',
      submittedAt: '2024-02-12T17:30:00Z',
      status: 'reviewed',
      managerFeedback: 'Great progress on the authentication module! The bug fixes were crucial. Keep up the excellent work.'
    },
    {
      id: '2',
      userId: user.id,
      date: '2024-02-11',
      content: 'Worked on database optimization queries. Improved performance by 40% on user data retrieval. Collaborated with the backend team on API endpoint design. Reviewed pull requests from team members.',
      submittedAt: '2024-02-11T18:15:00Z',
      status: 'reviewed',
      managerFeedback: 'Impressive performance improvements! Your collaboration with the backend team is valuable.'
    },
    {
      id: '3',
      userId: user.id,
      date: '2024-02-10',
      content: 'Focused on frontend component development. Created reusable UI components for the dashboard. Implemented responsive design for mobile devices. Participated in client requirements gathering meeting.',
      submittedAt: '2024-02-10T16:45:00Z',
      status: 'submitted'
    }
  ]);

  const todayEntry = progressHistory.find(entry => entry.date === getCurrentDate());
  const hasSubmittedToday = !!todayEntry;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressContent.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Submitting daily progress:', {
        content: progressContent,
        attachments: attachments.map(f => f.name),
        date: getCurrentDate(),
        userId: user.id
      });
      
      setProgressContent('');
      setAttachments([]);
      setIsSubmitting(false);
      
      // Show success message (in real app, this would update the history)
      alert('Daily progress submitted successfully!');
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reviewed': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reviewed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'submitted': return <Send className="w-4 h-4 text-blue-500" />;
      case 'draft': return <FileText className="w-4 h-4 text-gray-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
            Daily Progress
          </h1>
          <p className="text-gray-600 mt-2 text-lg">Share your daily accomplishments and updates with your team</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <Clock className="w-4 h-4" />
            <span>View History</span>
          </button>
        </div>
      </div>

      {/* Today's Status */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Today's Progress</h2>
              <p className="text-gray-600">{formatDate(new Date())}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {hasSubmittedToday ? (
              <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Submitted</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg">
                <Clock className="w-5 h-5" />
                <span className="font-medium">Pending</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Submission Form */}
      {!hasSubmittedToday && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Submit Today's Progress</h3>
                <p className="text-blue-100">Share what you accomplished today</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-6">
              {/* Progress Content */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  What did you accomplish today? *
                </label>
                <textarea
                  value={progressContent}
                  onChange={(e) => setProgressContent(e.target.value)}
                  rows={8}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Describe your daily accomplishments, tasks completed, challenges faced, and any important updates..."
                  required
                />
                <div className="mt-2 text-sm text-gray-500">
                  Be specific about what you worked on, any blockers you encountered, and your plans for tomorrow.
                </div>
              </div>

              {/* File Attachments */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Attachments (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload files or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOC, TXT, Images up to 10MB each</p>
                  </label>
                </div>

                {/* Attachment List */}
                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="p-1 hover:bg-red-100 text-red-500 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Templates */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">
                  Quick Templates
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setProgressContent(prev => prev + '\n\n📋 Tasks Completed:\n• \n\n🚧 Challenges Faced:\n• \n\n📅 Tomorrow\'s Plan:\n• ')}
                    className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <Target className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-sm">Task-focused</span>
                    </div>
                    <p className="text-xs text-gray-600">Tasks, challenges, and plans</p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setProgressContent(prev => prev + '\n\n🎯 Key Achievements:\n• \n\n🤝 Collaboration:\n• \n\n📈 Progress Made:\n• ')}
                    className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <Award className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-sm">Achievement-focused</span>
                    </div>
                    <p className="text-xs text-gray-600">Achievements and collaboration</p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setProgressContent(prev => prev + '\n\n📊 Project Updates:\n• \n\n🔧 Technical Work:\n• \n\n💡 Learnings:\n• ')}
                    className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-purple-500" />
                      <span className="font-medium text-sm">Project-focused</span>
                    </div>
                    <p className="text-xs text-gray-600">Project updates and learnings</p>
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setProgressContent('');
                  setAttachments([]);
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={!progressContent.trim() || isSubmitting}
                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  progressContent.trim() && !isSubmitting
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Progress</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Today's Submitted Progress */}
      {hasSubmittedToday && todayEntry && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Today's Progress Submitted</h3>
                  <p className="text-green-100">Submitted at {formatDateTime(todayEntry.submittedAt)}</p>
                </div>
              </div>
              <span className={`px-4 py-2 rounded-lg font-medium ${getStatusColor(todayEntry.status)}`}>
                {todayEntry.status === 'reviewed' ? 'Reviewed' : 'Under Review'}
              </span>
            </div>
          </div>

          <div className="p-8">
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h4 className="font-bold text-gray-900 mb-3">Progress Details</h4>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{todayEntry.content}</p>
            </div>

            {todayEntry.managerFeedback && (
              <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
                <h4 className="font-bold text-blue-900 mb-3 flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Manager Feedback</span>
                </h4>
                <p className="text-blue-800 leading-relaxed">{todayEntry.managerFeedback}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress History */}
      {showHistory && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Progress History</h3>
                <p className="text-gray-600 mt-1">Your previous daily progress submissions</p>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {progressHistory.map((entry) => (
                <div key={entry.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getStatusIcon(entry.status)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{formatDate(entry.date)}</h4>
                        <p className="text-sm text-gray-600">Submitted at {formatDateTime(entry.submittedAt)}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                      {entry.status === 'reviewed' ? 'Reviewed' : entry.status === 'submitted' ? 'Under Review' : 'Draft'}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                  </div>

                  {entry.managerFeedback && (
                    <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                      <h5 className="font-medium text-blue-900 mb-2 flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4" />
                        <span>Manager Feedback</span>
                      </h5>
                      <p className="text-blue-800 text-sm leading-relaxed">{entry.managerFeedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {progressHistory.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No progress history</h3>
                <p className="text-gray-600">Start submitting daily progress to build your history.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyProgress;