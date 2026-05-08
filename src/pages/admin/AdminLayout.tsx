import { Link, Outlet, useLocation } from 'react-router-dom';
import { Database, Users, ShieldAlert, Settings, LayoutDashboard, BookOpen } from 'lucide-react';

export function AdminLayout() {
  const location = useLocation();

  const links = [
    { path: '/admin', icon: LayoutDashboard, label: 'Overview' },
    { path: '/admin/teams', icon: Users, label: 'Teams' },
    { path: '/admin/round3', icon: ShieldAlert, label: 'Round 3 Control' },
    { path: '/admin/system', icon: Settings, label: 'Game Systems' },
    { path: '/admin/builder', icon: Database, label: 'Case Builder' },
    { path: '/admin/manifest', icon: BookOpen, label: 'Manifest (Answers)' },
  ];

  return (
    <div className="flex h-screen bg-background text-body font-mono">
      {/* Sidebar Nav */}
      <div className="w-64 border-r border-border bg-black flex flex-col pt-8">
        <h2 className="text-xl font-bold text-red-500 uppercase px-6 mb-8 tracking-widest">SysAdmin</h2>
        <nav className="flex-1 flex flex-col gap-2 px-4">
          {links.map(l => {
            const isActive = location.pathname === l.path;
            const Icon = l.icon;
            return (
              <Link 
                key={l.path} 
                to={l.path}
                className={`flex items-center gap-4 px-4 py-3 border transition-all ${isActive ? 'bg-red-900/20 border-red-500/50 text-red-400 font-bold' : 'border-transparent text-muted hover:bg-border'}`}
              >
                <Icon className="w-5 h-5" />
                <span>{l.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-background p-8">
        <Outlet />
      </div>
    </div>
  );
}
