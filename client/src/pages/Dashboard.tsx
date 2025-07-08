import React from 'react';
import { getCurrentUser, isDirector, isManager, isTeamLead } from '../utils/auth';
import DirectorDashboard from './DirectorDashboard';
import ManagerDashboard from './ManagerDashboard';
import TeamLeadDashboard from './TeamLeadDashboard';
import EmployeeDashboard from './EmployeeDashboard';

const Dashboard: React.FC = () => {
  const user = getCurrentUser();
  const isDir = isDirector(user.role);
  const isMgr = isManager(user.role);
  const isTeamLd = isTeamLead(user.role);

  if (isDir) {
    return <DirectorDashboard />;
  }

  if (isMgr) {
    return <ManagerDashboard />;
  }

  if (isTeamLd) {
    return <TeamLeadDashboard />;
  }

  return <EmployeeDashboard />;
};

export default Dashboard;