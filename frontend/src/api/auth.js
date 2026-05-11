import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '/api';
const AUTH = `${BASE}/auth`;

export const register = async (data) => {
  const res = await axios.post(`${AUTH}/register`, data);
  if (res.data.token) localStorage.setItem('token', res.data.token);
  return res.data.user;
};

export const login = async (data) => {
  const res = await axios.post(`${AUTH}/login`, data);
  if (res.data.token) localStorage.setItem('token', res.data.token);
  return res.data.user;
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const getMe = () => axios.get(`${AUTH}/me`);
