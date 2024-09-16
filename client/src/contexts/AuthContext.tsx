// AuthContext.tsx

import React, { createContext, useContext, useState } from "react";
import Cookies from "js-cookie";

type AuthContextType = {
  isAuthenticated: boolean;
  login: (aToken: string, rToken: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    localStorage.getItem("accessToken") ? true : false
  );

  const login = (aToken: string, rToken: string) => {
    Cookies.set("accessToken", aToken, {
      sameSite: "strict",
    });
    Cookies.set("refreshToken", rToken, {
      sameSite: "strict",
    });
    setIsAuthenticated(true);
  };

  const logout = () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");

    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
