import api from './api';

const login = async (email, password) => {
  const response = await api.post('/auth/login', {
    email,
    password,
  });
  if (response.data.token) {
    sessionStorage.setItem('user', JSON.stringify(response.data));
    sessionStorage.setItem('token', response.data.token);
  }
  return response.data;
};

const signup = async (name, email, password) => {
  const response = await api.post('/auth/signup', {
    name,
    email,
    password,
  });
  return response.data;
};

const logout = () => {
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('token');
};

const getCurrentUser = () => {
  try {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    return null;
  }
};

const isAdmin = () => {
  const user = getCurrentUser();
  if (!user) return false;
  
  const role = user.role || '';
  const roles = user.roles || [];
  
  // Robust check for ADMIN in any form
  return (
    role === 'ADMIN' || 
    role === 'ROLE_ADMIN' || 
    roles.includes('ADMIN') || 
    roles.includes('ROLE_ADMIN') ||
    (typeof role === 'string' && role.toUpperCase().includes('ADMIN'))
  );
};

const authService = {
  login,
  signup,
  logout,
  getCurrentUser,
  isAdmin
};

export default authService;
