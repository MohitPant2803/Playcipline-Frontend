import React, { createContext, useReducer, useEffect } from 'react';
import { authAPI } from '../api/client';

export const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  loading: true,
  error: null
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, token: action.token, loading: false };
    case 'LOGOUT':
      return { ...state, user: null, token: null, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'MERGE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : action.payload
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const existingToken = localStorage.getItem('token');
    const token = urlToken || existingToken;

    if (urlToken) {
      localStorage.setItem('token', urlToken);
      // Clear URL immediately
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (token) {
      authAPI.getMe()
        .then(res => {
          dispatch({ type: 'SET_USER', payload: res.data, token });
        })
        .catch((err) => {
          console.error('Auth error:', err.message);
          localStorage.removeItem('token');
          dispatch({ type: 'SET_LOADING', payload: false });
        });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const devLogin = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await authAPI.devLogin();
      localStorage.setItem('token', res.data.token);
      dispatch({ type: 'SET_USER', payload: res.data.user, token: res.data.token });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.error || err.message });
    }
  };

  const updateProfile = async (profile) => {
    const res = await authAPI.updateMe(profile);
    localStorage.setItem('token', res.data.token);
    dispatch({ type: 'SET_USER', payload: res.data.user, token: res.data.token });
    return res.data.user;
  };

  const mergeUser = (payload) => {
    dispatch({ type: 'MERGE_USER', payload });
  };

  return (
    <AuthContext.Provider value={{ ...state, logout, devLogin, updateProfile, mergeUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
