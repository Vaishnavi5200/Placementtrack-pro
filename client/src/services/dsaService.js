import api from './api';

// `filters` may include: search, status, difficulty, platform, topic
export const getProblems = async (filters = {}) => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== '' && value !== undefined)
  );
  const { data } = await api.get('/dsa', { params });
  return data; // contains: { success, stats, count, data }
};

export const getProblemById = async (id) => {
  const { data } = await api.get(`/dsa/${id}`);
  return data.data;
};

export const createProblem = async (payload) => {
  const { data } = await api.post('/dsa', payload);
  return data.data;
};

export const updateProblem = async (id, payload) => {
  const { data } = await api.put(`/dsa/${id}`, payload);
  return data.data;
};

export const deleteProblem = async (id) => {
  const { data } = await api.delete(`/dsa/${id}`);
  return data.data;
};
