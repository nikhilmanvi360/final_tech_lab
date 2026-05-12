import { Link, Outlet, useLocation } from 'react-router-dom';
import { Database, Users, ShieldAlert, Settings, LayoutDashboard, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

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
      <div className="w-64 border-r border-border bg-black/80 backdrop-blur-xl flex flex-col pt-8 z-50">
        <div className="px-6 mb-12">
          <h2 className="text-2xl font-black text-red-600 uppercase tracking-[0.2em]">SysAdmin</h2>
          <div className="h-1 w-12 bg-red-600 mt-2" />
        </div>
        
        <nav className="flex-1 flex flex-col gap-1 px-3">
          {links.map(l => {
            const isActive = location.pathname === l.path;
            const Icon = l.icon;
            return (
              <Link 
                key={l.path} 
                to={l.path}
                className={`group flex items-center gap-4 px-5 py-3 transition-all duration-300 relative overflow-hidden ${isActive ? 'text-red-500 font-black' : 'text-muted hover:text-white'}`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="admin-nav-active"
                    className="absolute inset-0 bg-red-950/20 border-l-4 border-red-600"
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-red-500' : 'group-hover:text-red-400'}`} />
                <span className="relative z-10 text-xs uppercase tracking-widest">{l.label}</span>
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
