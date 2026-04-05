import { useState } from "react";
import LoginScreen from "@/components/LoginScreen";
import DashboardScreen from "@/components/DashboardScreen";
import HoursScreen from "@/components/HoursScreen";
import CostsScreen from "@/components/CostsScreen";
import BottomNav from "@/components/BottomNav";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<'foreman' | 'boss'>('foreman');
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogin = (userRole: 'foreman' | 'boss') => {
    setRole(userRole);
    setActiveTab(userRole === 'boss' ? 'costs' : 'dashboard');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('dashboard');
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen">
      {activeTab === 'dashboard' && <DashboardScreen />}
      {activeTab === 'hours' && <HoursScreen />}
      {activeTab === 'costs' && <CostsScreen />}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />
    </div>
  );
};

export default Index;
