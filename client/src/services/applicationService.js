import api from './api';

// `filters` may include: search, status, type, workMode, source
export const getApplications = async (filters = {}) => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== '' && value !== undefined)
  );
  const { data } = await api.get('/applications', { params });
  return data.data;
};

export const getApplicationById = async (id) => {
  const { data } = await api.get(`/applications/${id}`);
  return data.data;
};

export const createApplication = async (payload) => {
  const { data } = await api.post('/applications', payload);
  return data.data;
};

export const updateApplication = async (id, payload) => {
  const { data } = await api.put(`/applications/${id}`, payload);
  return data.data;
};

export const deleteApplication = async (id) => {
  const { data } = await api.delete(`/applications/${id}`);
  return data.data;
};
