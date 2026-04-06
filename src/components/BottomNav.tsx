interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingCount?: number;
  incidentCount?: number;
}

const tabs = [
  {
    id: 'parte', label: 'Parte',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>,
  },
  {
    id: 'incidencias', label: 'Incidencias',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>,
  },
  {
    id: 'tracking', label: 'Tracking',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>,
  },
  {
    id: 'solicitudes', label: 'Solicitudes',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/></svg>,
  },
  {
    id: 'historial', label: 'Historial',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>,
  },
];

const BottomNav = ({ activeTab, onTabChange, pendingCount, incidentCount }: BottomNavProps) => {
  return (
    <div className="flex-shrink-0 border-t border-border" style={{ height: 'var(--nav-height, 60px)', background: 'hsl(var(--card))' }}>
      <div className="grid grid-cols-5 h-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const badge = tab.id === 'solicitudes' ? pendingCount : tab.id === 'incidencias' ? incidentCount : 0;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center gap-[3px] border-none bg-transparent cursor-pointer px-1.5 active:bg-background"
            >
              <div
                className="flex items-center justify-center w-[22px] h-[22px]"
                style={{ color: isActive ? 'hsl(var(--g6))' : 'hsl(var(--muted-foreground))' }}
              >
                {tab.icon}
              </div>
              <span
                className="text-[10px] font-semibold"
                style={{ color: isActive ? 'hsl(var(--g7))' : 'hsl(var(--muted-foreground))' }}
              >
                {tab.label}
              </span>
              {badge && badge > 0 ? (
                <span className="absolute top-1 right-2 w-[16px] h-[16px] rounded-full text-[9px] font-bold flex items-center justify-center text-white" style={{ background: '#e53e3e' }}>
                  {badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
