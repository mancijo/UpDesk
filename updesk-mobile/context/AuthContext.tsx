import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the User type
export interface User {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  setor: string;
  cargo: string;
}

// Define the AuthContext type
interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    // In a real app, you would typically fetch user data from an API upon login
    // and set it here. For simplicity, we're passing the user data directly.
    setUser(userData);
  };

  const logout = () => {
    // Clear user data from state
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
