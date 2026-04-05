import { LayoutDashboard, Clock, BarChart3, LogOut } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const tabs = [
  { id: 'dashboard', label: 'Panel', icon: LayoutDashboard },
  { id: 'hours', label: 'Fichaje', icon: Clock },
  { id: 'costs', label: 'Costes', icon: BarChart3 },
];

const BottomNav = ({ activeTab, onTabChange, onLogout }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border bottom-nav-safe z-50">
      <div className="flex items-center justify-around px-2 pt-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[60px] ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
        <button
          onClick={onLogout}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors min-w-[60px]"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-medium">Salir</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
