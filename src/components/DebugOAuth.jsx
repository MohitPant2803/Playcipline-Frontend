import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from './api/client';

/**
 * Debug component to troubleshoot OAuth setup
 * Add <DebugOAuth /> to your App.jsx temporarily to test
 */
export default function DebugOAuth() {
  const [info, setInfo] = useState({
    apiBaseUrl: API_BASE_URL,
    oauthUrl: `${API_BASE_URL}/api/auth/google`,
    backendOnline: false,
    backendError: null,
    envVar: import.meta.env.VITE_API_URL || 'NOT SET',
  });

  useEffect(() => {
    // Test if backend is online
    fetch(`${API_BASE_URL}/api/auth/me`, { 
      method: 'OPTIONS',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(() => {
        setInfo(prev => ({ ...prev, backendOnline: true }));
      })
      .catch(err => {
        setInfo(prev => ({ 
          ...prev, 
          backendOnline: false,
          backendError: err.message 
        }));
      });
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      backgroundColor: '#f0f0f0',
      border: '2px solid #333',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      maxWidth: '400px',
      zIndex: 9999,
      maxHeight: '300px',
      overflowY: 'auto'
    }}>
      <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>🔧 OAuth Debug Info</div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Environment:</strong>
        <div style={{ paddingLeft: '10px', color: '#666' }}>
          VITE_API_URL = {info.envVar}
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>API Base URL:</strong>
        <div style={{ paddingLeft: '10px', color: '#0066cc' }}>
          {info.apiBaseUrl}
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>OAuth URL:</strong>
        <div style={{ paddingLeft: '10px', color: '#0066cc' }}>
          {info.oauthUrl}
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>Backend Status:</strong>
        <div style={{ 
          paddingLeft: '10px', 
          color: info.backendOnline ? '#00aa00' : '#cc0000'
        }}>
          {info.backendOnline ? '✅ Online' : `❌ Offline: ${info.backendError}`}
        </div>
      </div>

      <div style={{ 
        marginTop: '10px', 
        paddingTop: '10px', 
        borderTop: '1px solid #ccc',
        fontSize: '11px',
        color: '#666'
      }}>
        <strong>Quick Fixes:</strong>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li>Is backend running on {info.apiBaseUrl}?</li>
          <li>Check browser console (F12) for errors</li>
          <li>Verify .env.local has VITE_API_URL</li>
          <li>Backend needs CORS configured</li>
        </ul>
      </div>

      <button 
        onClick={() => window.location.href = info.oauthUrl}
        style={{
          width: '100%',
          padding: '8px',
          marginTop: '10px',
          backgroundColor: '#0066cc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Test OAuth Button
      </button>

      <button 
        onClick={() => window.location.reload()}
        style={{
          width: '100%',
          padding: '8px',
          marginTop: '8px',
          backgroundColor: '#666',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Close Debug Panel
      </button>
    </div>
  );
}
