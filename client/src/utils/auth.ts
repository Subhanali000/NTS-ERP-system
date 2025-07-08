import { User, UserRole } from '../types';
import { mockUsers } from '../data/mockData';

// Store current user in localStorage for persistence
let currentUser: User | null = null;

export const getCurrentUser = (): User => {
  if (currentUser) return currentUser;
  
  // Try to get user from localStorage
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
    return currentUser!;
  }
  
  // Fallback to first user if no stored user (shouldn't happen in normal flow)
  return mockUsers[0];
};

export const setCurrentUser = (user: User): void => {
  currentUser = user;
  localStorage.setItem('currentUser', JSON.stringify(user));
  
  // Trigger a custom event to notify components of user update
  window.dispatchEvent(new CustomEvent('userUpdated', { detail: user }));
};

export const clearCurrentUser = (): void => {
  currentUser = null;
  localStorage.removeItem('currentUser');
};

// Updated authentication function that finds user by email only
export const authenticateUserByEmail = (email: string, password: string): User | null => {
  // Find user by email (password validation would be done by backend in real implementation)
  const user = mockUsers.find(u => 
    u.email.toLowerCase() === email.toLowerCase()
  );
  
  if (user && password === 'password123') { // Demo password validation
    setCurrentUser(user);
    return user;
  }
  
  return null;
};

// Legacy function for backward compatibility
export const authenticateUser = (email: string, role: UserRole): User | null => {
  const user = mockUsers.find(u => 
    u.email.toLowerCase() === email.toLowerCase() && u.role === role
  );
  
  if (user) {
    setCurrentUser(user);
    return user;
  }
  
  return null;
};

export const isDirector = (role: UserRole): boolean => {
  return [
    'global_hr_director',
    'global_operations_director',
    'engineering_director',
    'director_tech_team',
    'director_business_development'
  ].includes(role);
};

export const isManager = (role: UserRole): boolean => {
  return [
    'talent_acquisition_manager',
    'project_tech_manager',
    'quality_assurance_manager',
    'software_development_manager',
    'systems_integration_manager',
    'client_relations_manager'
  ].includes(role);
};

export const isTeamLead = (role: UserRole): boolean => {
  return role === 'team_lead';
};

export const isEmployee = (role: UserRole): boolean => {
  return role === 'employee';
};

export const isIntern = (role: UserRole): boolean => {
  return role === 'intern';
};

export const canApproveLeave = (user: User, requesterId: string): boolean => {
  const requester = mockUsers.find(u => u.id === requesterId);
  if (!requester) return false;

  // Directors can approve leave for their managers
  if (isDirector(user.role)) {
    return requester.managerId === user.id;
  }

  // Managers can approve leave for their direct reports
  if (isManager(user.role)) {
    return requester.managerId === user.id;
  }

  // Team leads can approve leave for their team members
  if (isTeamLead(user.role)) {
    return requester.managerId === user.id;
  }

  return false;
};

export const getApprovalChain = (userId: string): string[] => {
  const user = mockUsers.find(u => u.id === userId);
  if (!user) return [];

  const chain: string[] = [];

  // Add immediate manager
  if (user.managerId) {
    chain.push(user.managerId);
    
    // Add director if user is managed by a manager
    const manager = mockUsers.find(u => u.id === user.managerId);
    if (manager && manager.managerId) {
      chain.push(manager.managerId);
    }
  }

  return chain;
};

export const getRoleDisplayName = (role: UserRole): string => {
  const roleMap: Record<UserRole, string> = {
    'global_hr_director': 'Global HR Director',
    'global_operations_director': 'Global Operations Director',
    'engineering_director': 'Engineering Director',
    'director_tech_team': 'Director – Tech Team',
    'director_business_development': 'Director – Business Development',
    'talent_acquisition_manager': 'Talent Acquisition Manager',
    'project_tech_manager': 'Project/Tech Manager',
    'quality_assurance_manager': 'Quality Assurance Manager',
    'software_development_manager': 'Software Development Manager',
    'systems_integration_manager': 'Systems Integration Manager',
    'client_relations_manager': 'Client Relations Manager',
    'team_lead': 'Team Lead',
    'employee': 'Employee',
    'intern': 'Intern'
  };

  return roleMap[role] || role;
};

export const getSimpleDesignation = (role: UserRole): string => {
  if (isDirector(role)) return 'Director';
  if (isManager(role)) return 'Manager';
  if (isTeamLead(role)) return 'Team Lead';
  if (isEmployee(role)) return 'Employee';
  if (isIntern(role)) return 'Intern';
  return 'Staff';
};

export const getDepartmentColor = (department: string): string => {
  const colorMap: Record<string, string> = {
    'hr': 'bg-blue-500',
    'operations': 'bg-green-500',
    'engineering': 'bg-purple-500',
    'tech': 'bg-orange-500',
    'business_development': 'bg-pink-500',
    'quality_assurance': 'bg-yellow-500',
    'systems_integration': 'bg-indigo-500',
    'client_relations': 'bg-red-500'
  };

  return colorMap[department] || 'bg-gray-500';
};

// Get sample users for each role type for login
export const getSampleUsersByRole = () => {
  const directors = mockUsers.filter(u => isDirector(u.role));
  const managers = mockUsers.filter(u => isManager(u.role));
  const teamLeads = mockUsers.filter(u => isTeamLead(u.role));
  const employees = mockUsers.filter(u => isEmployee(u.role) || isIntern(u.role));

  return {
    director: directors[0] || null,
    manager: managers[0] || null,
    teamLead: teamLeads[0] || null,
    employee: employees[0] || null
  };
};

// User preferences management
export const getUserPreferences = () => {
  const preferences = localStorage.getItem('userPreferences');
  return preferences ? JSON.parse(preferences) : {
    theme: 'light',
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    taskReminders: true,
    leaveAlerts: true,
    projectUpdates: true,
    autoSave: true,
    compactView: false,
    showAvatars: true,
    animationsEnabled: true
  };
};

export const setUserPreferences = (preferences: any) => {
  localStorage.setItem('userPreferences', JSON.stringify(preferences));
  
  // Apply theme immediately
  if (preferences.theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Trigger preference update event
  window.dispatchEvent(new CustomEvent('preferencesUpdated', { detail: preferences }));
};

// Security settings management
export const getSecuritySettings = () => {
  const settings = localStorage.getItem('securitySettings');
  return settings ? JSON.parse(settings) : {
    twoFactorEnabled: false,
    sessionTimeout: '30',
    loginAlerts: true,
    deviceManagement: true
  };
};

export const setSecuritySettings = (settings: any) => {
  localStorage.setItem('securitySettings', JSON.stringify(settings));
};