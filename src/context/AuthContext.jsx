import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load: check localStorage for saved session
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await API.post('/api/auth/login', { email, password });
      const { token: userToken, userData } = response.data;
      
      // Save to states
      setToken(userToken);
      setUser(userData);
      
      // Save to localStorage
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    }
  };

// const register = async (name, email, password) => {
//   try {
//     const response = await API.post("/api/auth/register", {
//       name,
//       email,
//       password,
//     });

//     const { token: userToken, userData } = response.data;

//     setToken(userToken);
//     setUser(userData);

//     localStorage.setItem("token", userToken);
//     localStorage.setItem("user", JSON.stringify(userData));

//     return {
//       success: true,
//       message: response.data.message,
//     };
//   } catch (error) {
//     console.error("Registration error:", error);

//     return {
//       success: false,
//       message:
//         error.response?.data?.message ||
//         "Registration failed. Please try again.",
//     };
//   }
// };

const register = async (name, email, password) => {
  try {
    const response = await API.post("/api/auth/register", {
      name,
      email,
      password,
    });

    const { token, userData, message } = response.data;

    setToken(token);
    setUser(userData);

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    return {
      success: true,
      message,
    };

  } catch (error) {
    console.error(error);

    let message = "Something went wrong.";

    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = error.response.data?.message || "Invalid data.";
          break;

        case 401:
          message = "Invalid email or password.";
          break;

        case 409:
        case 422:
          message = error.response.data?.message || "Email already exists.";
          break;

        case 500:
          // Agar backend HTML bhej raha hai
          if (typeof error.response.data === "string") {
            message =
              "Server error. Please try again later.";
          } else {
            message =
              error.response.data?.message ||
              "Server error.";
          }
          break;

        default:
          message =
            error.response.data?.message ||
            `Request failed (${error.response.status})`;
      }
    } else if (error.request) {
      message = "Unable to connect to server.";
    } else {
      message = error.message;
    }

    return {
      success: false,
      message,
    };
  }
};


  const logout = async () => {
    try {
      await API.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error on backend:', error);
    } finally {
      // Always clear local session even if backend call fails/warns
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
