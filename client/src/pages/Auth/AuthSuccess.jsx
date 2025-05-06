import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthSuccess() {
  const navigate = useNavigate();
  const {user} = useAuth();

  useEffect(() => {
    // After successful OAuth login, redirect to home page
    if(user){
      navigate('/');
    }else{
      navigate('/login');
    }
  }, [navigate, user]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Authentication Successful</h2>
        <p>Redirecting to dashboard...</p>
      </div>
    </div>
  );
} 