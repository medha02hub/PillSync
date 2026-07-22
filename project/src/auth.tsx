import { createContext, useContext, useState, ReactNode } from "react";
import { supabase } from "@/supabaseClient";

// Shape of the logged-in user (matches the users table)
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  age: number | null;
  phone: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Restore user from localStorage on page reload
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // Login: look up the user by email + password (plain text, per spec)
  async function login(email: string, password: string) {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, role, age, phone")
      .eq("email", email)
      .eq("password", password)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new Error("Invalid email or password");

    localStorage.setItem("user", JSON.stringify(data));
    setUser(data as User);
  }

  // Register: insert a new user, then log them in
  async function register(data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) {
    const { error } = await supabase.from("users").insert({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
    });

    if (error) {
      // Translate common Postgres errors into friendly messages
      if (error.code === "23505") {
        throw new Error("Email already registered");
      }
      throw new Error(error.message);
    }

    await login(data.email, data.password);
  }

  // Logout: just clear localStorage
  function logout() {
    localStorage.removeItem("user");
    setUser(null);
  }

  // Re-fetch the current user from the database (used after profile edits)
  async function refreshUser() {
    if (!user) return;
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, role, age, phone")
      .eq("id", user.id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (data) {
      setUser(data as User);
      localStorage.setItem("user", JSON.stringify(data));
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook so components can access auth state
export function useAuth() {
  return useContext(AuthContext);
}
