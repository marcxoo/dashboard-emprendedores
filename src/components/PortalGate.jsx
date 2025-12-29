import { useAuth } from '../context/AuthContext';
import Login from './Login';
import Portal from './Portal';

export default function PortalGate() {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Portal />;
    }

    return <Login />;
}
