import { createContext, useContext, useEffect, useState } from 'react';
import axiosInstance from "../utils/axiosConfig";
import { Navigate, useNavigate } from 'react-router-dom';

const AuthContext = createContext({
  user: null,
  loading: true,
  setUser: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axiosInstance.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        setUser(null);
      }finally{
        setLoading(false)
      }
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
