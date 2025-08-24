import api from './api';

export const fetchUsers = async () => {
  try {
    const response = await api.get('/api/users');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch users');
  }
};