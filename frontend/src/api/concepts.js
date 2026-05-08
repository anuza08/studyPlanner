import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '/api';
const API = `${BASE}/concepts`;

export const getTodayConcepts = () => axios.get(`${API}/today`);
export const getAllConcepts = () => axios.get(API);
export const createConcept = (data) => axios.post(API, data);
export const completeReview = (conceptId, reviewId) =>
  axios.patch(`${API}/${conceptId}/reviews/${reviewId}/complete`);
export const addNote = (conceptId, data) =>
  axios.post(`${API}/${conceptId}/notes`, data);
export const deleteNote = (conceptId, noteId) =>
  axios.delete(`${API}/${conceptId}/notes/${noteId}`);
export const updateConcept = (conceptId, data) => axios.put(`${API}/${conceptId}`, data);
export const togglePriority = (conceptId) => axios.patch(`${API}/${conceptId}/priority`);
export const deleteConcept = (conceptId) => axios.delete(`${API}/${conceptId}`);
