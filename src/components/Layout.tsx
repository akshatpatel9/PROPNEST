import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, UserCircle, LogOut, PlusSquare, LayoutDashboard, PenTool, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui';

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans relative">
      {/* Rich Background Image */}
      <div 
        className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000")',
        }}
      >
        {/* Dark/Rich overlay to ensure text readability */}
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px]"></div>
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-900/60 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-emerald-400">
            <Home className="h-6 w-6" />
            <span className="text-xl font-bold tracking-tight text-white">RIGHT square</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors">Browse</Link>
            <Link to="/ai-floor-plan" className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1">
              <PenTool className="h-4 w-4" /> AI Floor Plans
            </Link>
            <Link to="/image-analyzer" className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1">
              <ImageIcon className="h-4 w-4" /> Analyze Property
            </Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                <Link to="/add-property">
                  <Button className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white border-none">
                    <PlusSquare className="h-4 w-4" /> List Property
                  </Button>
                </Link>
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/20">
                  <span className="text-sm font-medium text-slate-200 flex items-center gap-2">
                    <UserCircle className="h-5 w-5 text-emerald-400" />
                    {user.name}
                  </span>
                  <Button variant="ghost" onClick={handleLogout} className="p-2 text-slate-300 hover:text-white hover:bg-white/10" aria-label="Logout">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 ml-4">
                <Link to="/login">
                  <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10">Log in</Button>
                </Link>
                <Link to="/login">
                  <Button className="bg-emerald-600 hover:bg-emerald-500 text-white border-none">Sign up</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <Outlet />
      </main>

      <footer className="border-t border-white/10 bg-slate-900/80 backdrop-blur-md py-8 mt-auto relative z-10">
        <div className="container mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} RIGHT square. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
