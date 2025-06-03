// src/renderer.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // Gebruik 'react-dom/client' voor React 18+
import App from './App.jsx'; // Zorg dat je verwijst naar het .jsx bestand

const rootElement = document.getElementById('app'); // Of 'root' afhankelijk van je HTML
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}