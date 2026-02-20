import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';

function App() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to="/chat" />}
        />
        <Route
          path="/register"
          element={!user ? <RegisterPage /> : <Navigate to="/chat" />}
        />
        <Route
          path="/chat/*"
          element={user ? <ChatPage /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to={user ? "/chat" : "/login"} />} />
      </Routes>
    </div>
  );
}

export default App;
