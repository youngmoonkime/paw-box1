import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

export interface GoogleUser {
  sub: string;
  name: string;
  email: string;
  picture: string;
  given_name: string;
}

interface AuthState {
  user: GoogleUser | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  loginWithCredential: (credential: string) => void;
  logout: () => void;
}

const STORAGE_KEY = "paw_box_user";

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  loginWithCredential: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, isLoading: true });

  // 새로고침 후 복원
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setState({ user: JSON.parse(saved), isLoading: false });
        return;
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setState((s) => ({ ...s, isLoading: false }));
  }, []);

  const loginWithCredential = (credential: string) => {
    try {
      const user = jwtDecode<GoogleUser>(credential);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      setState({ user, isLoading: false });
    } catch (e) {
      console.error("JWT 디코드 실패:", e);
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ user: null, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, loginWithCredential, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
