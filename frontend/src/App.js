import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import RouterApp from './router';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <RouterApp />
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
