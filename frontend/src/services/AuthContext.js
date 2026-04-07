import { createContext, useContext, useEffect, useState } from "react";
import { getProfile, loginUser } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem("health_assistant_access_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const profile = await getProfile();
        setUser(profile);
      } catch (error) {
        localStorage.removeItem("health_assistant_access_token");
        localStorage.removeItem("health_assistant_refresh_token");
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    localStorage.setItem("health_assistant_access_token", data.tokens.access);
    localStorage.setItem("health_assistant_refresh_token", data.tokens.refresh);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("health_assistant_access_token");
    localStorage.removeItem("health_assistant_refresh_token");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
