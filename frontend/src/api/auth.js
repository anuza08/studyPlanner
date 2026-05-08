import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '/api';
const AUTH = `${BASE}/auth`;

export const register = (data) => axios.post(`${AUTH}/register`, data);
export const login = (data) => axios.post(`${AUTH}/login`, data);
export const logout = () => axios.post(`${AUTH}/logout`);
export const getMe = () => axios.get(`${AUTH}/me`);
