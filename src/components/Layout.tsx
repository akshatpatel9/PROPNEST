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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-indigo-600">
            <Home className="h-6 w-6" />
            <span className="text-xl font-bold tracking-tight">RIGHT square</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Browse</Link>
            <Link to="/ai-floor-plan" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
              <PenTool className="h-4 w-4" /> AI Floor Plans
            </Link>
            <Link to="/image-analyzer" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
              <ImageIcon className="h-4 w-4" /> Analyze Property
            </Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                <Link to="/add-property">
                  <Button variant="primary" className="gap-2">
                    <PlusSquare className="h-4 w-4" /> List Property
                  </Button>
                </Link>
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200">
                  <span className="text-sm font-medium text-slate-900 flex items-center gap-2">
                    <UserCircle className="h-5 w-5 text-slate-400" />
                    {user.name}
                  </span>
                  <Button variant="ghost" onClick={handleLogout} className="p-2" aria-label="Logout">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 ml-4">
                <Link to="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link to="/login">
                  <Button variant="primary">Sign up</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} RIGHT square. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
