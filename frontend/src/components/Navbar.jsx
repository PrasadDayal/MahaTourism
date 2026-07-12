import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Map, MapPin, Sparkles, LogIn, Image as ImageIcon, LogOut, User, Menu, X, Flame, Coffee, ShieldCheck } from 'lucide-react';
import authService from '../services/auth.service';

const Navbar = () => {
  const [currentUser, setCurrentUser] = useState(undefined);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(undefined);
    setIsMenuOpen(false);
    navigate('/login');
    window.location.reload();
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: <Map className="w-4 h-4" /> },
    { name: 'Destinations', path: '/destinations', icon: <MapPin className="w-4 h-4" /> },
    { name: 'Festivals', path: '/festivals', icon: <Flame className="w-4 h-4" /> },
    { name: 'Gallery', path: '/gallery', icon: <ImageIcon className="w-4 h-4" /> },
    { name: 'AI Planner', path: '/ai-itinerary', icon: <Sparkles className="w-4 h-4" /> },
  ];

  if (currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'ROLE_ADMIN')) {
    navLinks.push({ name: 'Admin', path: '/admin', icon: <ShieldCheck className="w-4 h-4" /> });
  }

  return (
    <nav className="bg-white shadow-md fixed w-full z-50 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-emerald-600 shrink-0">
            <Map className="w-8 h-8" />
            <span>MahaTourism</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className="text-gray-600 hover:text-emerald-600 font-medium flex items-center space-x-1 transition"
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
          </div>

          {/* User Auth Buttons (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-700 font-medium">
                  <div className="bg-emerald-100 p-2 rounded-full">
                    <User className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span>{currentUser.name}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center space-x-1 bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-100">
                <LogIn className="w-4 h-4 mr-1" />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-emerald-600 p-2"
            >
              {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-2 shadow-xl animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center space-x-3 p-4 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition font-bold"
            >
              <div className="bg-gray-100 p-2 rounded-lg group-hover:bg-emerald-100">
                {link.icon}
              </div>
              <span>{link.name}</span>
            </Link>
          ))}
          <hr className="my-2 border-gray-100" />
          {currentUser ? (
            <div className="space-y-2 pt-2">
              <div className="flex items-center space-x-3 p-4 text-gray-900 font-black">
                <div className="bg-emerald-100 p-2 rounded-full">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
                <span>{currentUser.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 p-4 text-red-600 hover:bg-red-50 rounded-xl transition font-bold"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              onClick={() => setIsMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 p-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg"
            >
              <LogIn className="w-5 h-5" />
              <span>Login / Register</span>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
