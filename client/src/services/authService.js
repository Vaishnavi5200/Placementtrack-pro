import api from './api';

export const registerUser = async (payload) => {
  const { data } = await api.post('/auth/register', payload);
  return data.data;
};

export const loginUser = async (payload) => {
  const { data } = await api.post('/auth/login', payload);
  return data.data;
};

export const fetchProfile = async () => {
  const { data } = await api.get('/auth/profile');
  return data.data;
};
