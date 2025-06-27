import {
  useState,
  ReactNode,
  createContext,
  useContext,
  useEffect,
} from 'react';
import { validateSession } from '@/api/auth';
import { logout } from '@/api/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  setAuthenticated: (isAuthenticated: boolean) => void;
  handleLogout: (logoutMessage?: string) => void;
  isLoggingOut: boolean;
  logoutMessage: string;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logoutMessage, setLogoutMessage] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        await validateSession();
        setAuthenticated(true);
      } catch {
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    void checkSession();
  }, []);

  const handleLogout = async (logoutMessage?: string) => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      setIsLoggingOut(false);
    } finally {
      setLogoutMessage(logoutMessage || '');
      setAuthenticated(false);
      setIsLoggingOut(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        setAuthenticated,
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        handleLogout,
        isLoggingOut,
        logoutMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be within AuthProvider');
  return context;
};
