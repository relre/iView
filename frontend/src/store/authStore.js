import { create } from 'zustand';

const useAuthStore = create((set) => ({
  token: localStorage.getItem('token'),
  email: localStorage.getItem('email'),
  setToken: (token, email) => {
    localStorage.setItem('token', token);
    localStorage.setItem('email', email);
    set({ token, email });
  },
  clearToken: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    set({ token: null, email: null });
  },
}));

export default useAuthStore;