import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Options from './pages/Options';
import Orders from './pages/Orders';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';

function PrivateRoute({ children }: { children: JSX.Element }) {
    const { user, loading } = useAuth()!;
    if (loading) return <div>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
}

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
                <PrivateRoute>
                    <Layout />
                </PrivateRoute>
            }>
                <Route index element={<Dashboard />} />
                <Route path="options" element={<Options />} />
                <Route path="orders" element={<Orders />} />
            </Route>
        </Routes>
    );
}

export default App;
